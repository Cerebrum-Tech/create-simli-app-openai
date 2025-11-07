import React from "react";

type KeyboardProps = {
  onKeyPress: (key: string) => void;
};

const letterRows: string[][] = [
  "Q W E R T Y U I O P Ğ Ü".split(" "),
  "A S D F G H J K L Ş İ".split(" "),
  "Z X C V B N M Ö Ç".split(" "),
];

// Sadece 4.satırda tüm ekstra/big tuşları gösteriyoruz
const extraKeys: { label: string; value: string; width?: number }[] = [
  { label: "←", value: "LEFT", width: 40 },
  { label: "\u2423  Space", value: "SPACE", width: 150 },
  { label: "→", value: "RIGHT", width: 40 },
  { label: "⌫ Sil", value: "BACKSPACE", width: 70 }
];

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => (
  <div style={{ display: "inline-block", padding: 8, background: "#eee", borderRadius: 10 }}>
    {letterRows.map((row, idx) => (
      <div key={idx} style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>
        {row.map((key) => (
          <button
            key={key}
            onClick={() => onKeyPress(key)}
            style={{
              margin: 2,
              minWidth: 35,
              minHeight: 35,
              fontSize: 18,
              borderRadius: 5,
              cursor: "pointer",
              border: "1px solid #444",
              background: "#fff",
              transition: "background 0.2s"
            }}
            type="button"
          >
            {key}
          </button>
        ))}
      </div>
    ))}
    <div style={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
      {extraKeys.map((btn) => (
        <button
          key={btn.value}
          onClick={() => onKeyPress(btn.value)}
          style={{
            margin: 2,
            minWidth: btn.width ?? 40,
            minHeight: 35,
            fontSize: 18,
            borderRadius: 5,
            cursor: "pointer",
            border:
              btn.value === "BACKSPACE"
                ? "1px solid #ff7675"
                : "1px solid #444",
            background:
              btn.value === "BACKSPACE"
                ? "#ffecec"
                : btn.value === "SPACE"
                ? "#f5f5f5"
                : "#fff",
            color: btn.value === "BACKSPACE" ? "#d63031" : "#222",
            fontWeight: btn.value === "BACKSPACE" ? "bold" : "normal"
          }}
          type="button"
        >
          {btn.label}
        </button>
      ))}
    </div>
  </div>
);

export default Keyboard;