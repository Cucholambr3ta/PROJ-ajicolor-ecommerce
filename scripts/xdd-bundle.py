#!/usr/bin/env python3
"""xdd-bundle.py — Web bundles MVP impl (Sprint 23, ADR-0017 spec).

Empaqueta skills/agents/workflows en archivo .xddbundle (zip + manifest.json).

Comandos:
  pack PATH -o OUT.xddbundle       — empaqueta dir/files en bundle
  verify FILE.xddbundle             — valida manifest + license + estructura
  install FILE.xddbundle [--to=DIR] — extrae a project dir
  inspect FILE.xddbundle            — muestra manifest sin extraer
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

__version__ = "0.1.0-dev"

REQUIRED_FILES = ["manifest.json", "LICENSE"]
MANIFEST_REQUIRED = ["spec_version", "name", "version", "author", "license"]


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def compute_signature(manifest_bytes: bytes, key: str = "x-dd-default-key") -> str:
    """HMAC-SHA256 del manifest content."""
    return "sha256:" + hmac.new(key.encode(), manifest_bytes,
                                  hashlib.sha256).hexdigest()


def pack(source: Path, output: Path, name: str | None = None,
         version: str = "0.1.0", author: str = "unknown",
         license_str: str = "MIT", description: str = "") -> dict:
    """Empaqueta source/ a output.xddbundle."""
    if not source.exists() or not source.is_dir():
        raise ValueError(f"source must be a directory: {source}")
    name = name or source.name
    # Build manifest
    contents = {"skills": [], "agents": [], "workflows": []}
    for sub in ["skills", "agents", "workflows"]:
        d = source / sub
        if d.exists():
            contents[sub] = sorted([f.stem for f in d.iterdir()
                                     if f.is_file() or f.is_dir()])
    manifest = {
        "spec_version": "0.1.0",
        "name": name,
        "version": version,
        "author": author,
        "license": license_str,
        "description": description,
        "created_at": utcnow_iso(),
        "depends_on": {"xdd": ">=0.1.0"},
        "contents": contents,
    }
    manifest_bytes = json.dumps(manifest, indent=2).encode()
    signature = compute_signature(manifest_bytes)
    manifest["signature"] = signature
    final_manifest_bytes = json.dumps(manifest, indent=2).encode()

    # Write zip
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("manifest.json", final_manifest_bytes)
        # Include LICENSE (cargar del source o usar fallback)
        license_path = source / "LICENSE"
        if license_path.exists():
            zf.write(license_path, "LICENSE")
        else:
            zf.writestr("LICENSE", f"{license_str} License\n\n(see https://opensource.org/licenses/{license_str})\n")
        # Include contenidos
        for root, dirs, files in os.walk(source):
            for f in files:
                fp = Path(root) / f
                if fp.name in {"manifest.json", "LICENSE"}:
                    continue
                arcname = str(fp.relative_to(source))
                zf.write(fp, arcname)
    return manifest


def verify(bundle: Path) -> dict:
    """Valida bundle: zip valido + manifest required fields + license + signature."""
    if not bundle.exists():
        raise ValueError(f"bundle not found: {bundle}")
    errors = []
    try:
        with zipfile.ZipFile(bundle, "r") as zf:
            names = zf.namelist()
            for req in REQUIRED_FILES:
                if req not in names:
                    errors.append(f"missing required file: {req}")
            if "manifest.json" in names:
                manifest = json.loads(zf.read("manifest.json"))
                for field in MANIFEST_REQUIRED:
                    if field not in manifest:
                        errors.append(f"manifest missing field: {field}")
                # Validate signature
                if "signature" in manifest:
                    stripped = {k: v for k, v in manifest.items() if k != "signature"}
                    stripped_bytes = json.dumps(stripped, indent=2).encode()
                    expected = compute_signature(stripped_bytes)
                    if expected != manifest["signature"]:
                        errors.append(f"signature mismatch (got: {manifest['signature']}, expected: {expected})")
                # License whitelist for community bundles
                license_lower = manifest.get("license", "").lower()
                if any(l in license_lower for l in ["agpl", "proprietary"]):
                    errors.append(f"license incompatible with X-DD MIT pure: {manifest['license']}")
    except zipfile.BadZipFile:
        errors.append("not a valid zip file")
    except json.JSONDecodeError as e:
        errors.append(f"manifest.json invalid: {e}")
    return {"valid": not errors, "errors": errors}


def install(bundle: Path, target: Path, force: bool = False) -> dict:
    """Extrae bundle a target/."""
    if not bundle.exists():
        raise ValueError(f"bundle not found: {bundle}")
    target.mkdir(parents=True, exist_ok=True)
    extracted = []
    with zipfile.ZipFile(bundle, "r") as zf:
        for name in zf.namelist():
            tp = target / name
            if tp.exists() and not force:
                continue
            tp.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(name) as src, tp.open("wb") as dst:
                dst.write(src.read())
            extracted.append(name)
    return {"extracted": extracted, "count": len(extracted)}


def cmd_pack(args):
    try:
        manifest = pack(
            source=Path(args.source),
            output=Path(args.output),
            name=args.name,
            version=args.bundle_version or "0.1.0",
            author=args.author or "unknown",
            license_str=args.license or "MIT",
            description=args.description or "",
        )
    except ValueError as e:
        print(f"[bundle] ERROR: {e}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps({"manifest": manifest, "file": args.output}, indent=2))
    else:
        print(f"[bundle] ✓ packed {args.source} → {args.output}")
        print(f"  name: {manifest['name']}")
        print(f"  version: {manifest['version']}")
        print(f"  license: {manifest['license']}")
        print(f"  signature: {manifest['signature']}")
    return 0


def cmd_verify(args):
    result = verify(Path(args.bundle))
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if result["valid"]:
            print(f"[bundle] ✅ valid: {args.bundle}")
        else:
            print(f"[bundle] ❌ invalid: {args.bundle}")
            for e in result["errors"]:
                print(f"  - {e}")
    return 0 if result["valid"] else 1


def cmd_install(args):
    try:
        # Verify first
        vresult = verify(Path(args.bundle))
        if not vresult["valid"]:
            print(f"[bundle] ERROR: verify failed before install. Errors:",
                  file=sys.stderr)
            for e in vresult["errors"]:
                print(f"  - {e}", file=sys.stderr)
            return 2
        result = install(Path(args.bundle), Path(args.to), force=args.force)
    except ValueError as e:
        print(f"[bundle] ERROR: {e}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"[bundle] ✓ installed {result['count']} files to {args.to}")
    return 0


def cmd_inspect(args):
    bundle = Path(args.bundle)
    if not bundle.exists():
        print(f"[bundle] not found", file=sys.stderr)
        return 1
    with zipfile.ZipFile(bundle, "r") as zf:
        manifest = json.loads(zf.read("manifest.json"))
    if args.json:
        print(json.dumps(manifest, indent=2))
    else:
        print(f"[bundle] manifest of {args.bundle}:")
        for k, v in manifest.items():
            print(f"  {k}: {v}")
    return 0


def build_parser():
    p = argparse.ArgumentParser(prog="xdd-bundle", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--version", action="version", version=f"xdd-bundle {__version__}")
    sub = p.add_subparsers(dest="command", required=True)

    p_p = sub.add_parser("pack", help="Pack source dir into .xddbundle")
    p_p.add_argument("source", help="Source directory")
    p_p.add_argument("-o", "--output", required=True, help="Output .xddbundle path")
    p_p.add_argument("--name")
    p_p.add_argument("--bundle-version")
    p_p.add_argument("--author")
    p_p.add_argument("--license", default="MIT")
    p_p.add_argument("--description")
    p_p.add_argument("--json", action="store_true")
    p_p.set_defaults(func=cmd_pack)

    p_v = sub.add_parser("verify", help="Verify bundle integrity + license")
    p_v.add_argument("bundle")
    p_v.add_argument("--json", action="store_true")
    p_v.set_defaults(func=cmd_verify)

    p_i = sub.add_parser("install", help="Extract bundle to project dir")
    p_i.add_argument("bundle")
    p_i.add_argument("--to", default=".", help="Target dir")
    p_i.add_argument("--force", action="store_true")
    p_i.add_argument("--json", action="store_true")
    p_i.set_defaults(func=cmd_install)

    p_in = sub.add_parser("inspect", help="Show manifest without extracting")
    p_in.add_argument("bundle")
    p_in.add_argument("--json", action="store_true")
    p_in.set_defaults(func=cmd_inspect)

    return p


def main(argv=None):
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
