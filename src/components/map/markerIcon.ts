import L from "leaflet";

/**
 * Leaflet's default marker points at image files the bundler doesn't ship, so
 * every pin here is a `divIcon` instead — no assets, and it can carry the barber's
 * own colour, photo and selected state.
 */
export function createPinIcon(options: {
  color: string;
  label: string;
  photo?: string | null;
  /** The selected usta's pin is drawn larger and ringed, so it stands out. */
  active?: boolean;
}): L.DivIcon {
  const size = options.active ? 44 : 34;
  const inner = options.active ? size - 12 : size - 8;

  const content = options.photo
    ? `<img src="${options.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-size:${options.active ? 16 : 13}px;font-weight:700;color:#fff;">${options.label}</span>`;

  return L.divIcon({
    className: "qn-pin",
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:${size}px;height:${size}px;border-radius:50% 50% 50% 4px;
        transform:rotate(-45deg);
        background:${options.color};
        border:${options.active ? 3 : 2}px solid #fff;
        box-shadow:0 4px 12px rgba(0,0,0,0.28)${options.active ? ",0 0 0 4px rgba(20,94,229,0.35)" : ""};
        overflow:hidden;
        transition:width .15s ease,height .15s ease;
      ">
        <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;width:${inner}px;height:${inner}px;border-radius:50%;overflow:hidden;">
          ${content}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 2],
  });
}
