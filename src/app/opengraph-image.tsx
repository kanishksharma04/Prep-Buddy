import { ImageResponse } from "next/og";

export const alt = "Prep Buddy — plan, study, succeed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          gap: 28,
          background: "#1a1510",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path
            d="M14 28a18 18 0 0 1 36 0"
            fill="none"
            stroke="#e2793f"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="32" cy="9.4" r="1.8" fill="#e2793f" />
          <circle cx="14" cy="28" r="1.8" fill="#e2793f" />
          <circle cx="50" cy="28" r="1.8" fill="#e2793f" />
          <path
            d="M32 16v10.5l6.5 5.5"
            fill="none"
            stroke="#ede3cc"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 29c9 .3 20 2.6 26 10v19c-6-7.4-17-9.7-26-10V29Z"
            fill="#ede3cc"
          />
          <path
            d="M58 29c-9 .3-20 2.6-26 10v19c6-7.4 17-9.7 26-10V29Z"
            fill="#ede3cc"
          />
          <path
            d="M37.5 43.5l4 4 8-8.5"
            fill="none"
            stroke="#1a1510"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
          <span style={{ color: "#ede3cc" }}>Prep&nbsp;</span>
          <span style={{ color: "#e2793f" }}>Buddy</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#ab9a78", letterSpacing: 4 }}>
          PLAN. STUDY. SUCCEED.
        </div>
      </div>
    ),
    { ...size },
  );
}
