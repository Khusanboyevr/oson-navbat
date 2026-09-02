import L from "leaflet";

/**
 * Leaflet's default marker points at image files the bundler doesn't ship, so
 * every pin here is a `divIcon` instead — no assets, and it can carry the barber's
 * own colour and initial.
 */
export function createPinIcon(options: { color: string; label: string; photo?: string | null }): L.DivIcon {
  const inner = options.photo
    ? `<img src="${options.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-size:13px;font-weight:700;color:#fff;">${options.label}</span>`;

  return L.divIcon({
    className: "qn-pin",
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:34px;height:34px;border-radius:50% 50% 50% 4px;
        transform:rotate(-45deg);
        background:${options.color};
        border:2px solid #fff;
        box-shadow:0 4px 12px rgba(0,0,0,0.28);
        overflow:hidden;
      ">
        <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;overflow:hidden;">
          ${inner}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}
