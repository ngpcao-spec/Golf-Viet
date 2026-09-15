import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          background: "#090C0A",
          color: "#D8B45A",
          fontSize: 34,
          letterSpacing: 4,
          fontWeight: 700,
        }}
      >
        <div>VIET</div>
        <div>GOLF</div>
      </div>
    ),
    size,
  );
}
