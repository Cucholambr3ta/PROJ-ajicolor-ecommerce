import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#c026d3",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -2,
          }}
        >
          AJICOLOR
        </div>
        <div style={{ fontSize: 32, color: "#ffd141", fontWeight: 700, marginTop: 12 }}>
          Poleras exclusivas de bandas
        </div>
      </div>
    ),
    { ...size }
  );
}
