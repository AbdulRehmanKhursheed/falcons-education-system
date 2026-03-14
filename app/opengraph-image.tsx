import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Falcons Education System — School Education & Evening Coaching in Rawalpindi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #003f72 0%, #00a3fe 100%)",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-60px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />

      {/* Top badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "999px",
          padding: "8px 24px",
          marginBottom: "28px",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "2px",
          }}
        >
          ADMISSIONS OPEN 2026
        </span>
      </div>

      {/* School name */}
      <div
        style={{
          fontSize: "64px",
          fontWeight: 800,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.1,
          marginBottom: "16px",
          textShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        Falcons Education System
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: "26px",
          color: "rgba(255,255,255,0.88)",
          textAlign: "center",
          marginBottom: "40px",
          fontWeight: 400,
        }}
      >
        School Education &amp; Evening Coaching in Rawalpindi
      </div>

      {/* Program pills */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "36px",
        }}
      >
        {[
          "Nursery",
          "Montessori",
          "KG",
          "Evening Coaching",
          "Computer Courses",
        ].map((p) => (
          <div
            key={p}
            style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: 500,
            }}
          >
            {p}
          </div>
        ))}
      </div>

      {/* Contact + address */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          📞 0311-9911288
        </div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px" }}>
          Kamalabad Road, Near Bakra Mandi, Rawalpindi
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
