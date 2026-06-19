import { SearchResult } from "./types";
import { CATEGORY_MAP } from "./mapConstants";

interface MapSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  searchResults: SearchResult[];
  searchLoading: boolean;
  handleSelectPoi: (poi: SearchResult) => void;
  setSearchedPoi: (poi: SearchResult | null) => void;
}

export default function MapSearchBar({
  searchQuery,
  setSearchQuery,
  showDropdown,
  setShowDropdown,
  searchResults,
  searchLoading,
  handleSelectPoi,
  setSearchedPoi,
}: MapSearchBarProps) {
  const hasResults = searchResults.length > 0;
  const showPanel = showDropdown && (hasResults || searchLoading);

  return (
    <div
      style={{
        position: "absolute",
        top: "16px", // Cùng hàng với toolbar
        left: "50%",
        transform: "translateX(-463px)", // Dịch thêm 113px (3cm)
        zIndex: 1000,
        width: "240px",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderRadius: showPanel ? "16px 16px 0 0" : "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          padding: "6px 12px", // Giảm từ 10px 14px xuống 6px 12px
          gap: "8px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          height: "36px", // Thêm height cố định
        }}
      >
        <span style={{ fontSize: "14px", flexShrink: 0 }}>🔍</span>{" "}
        {/* Giảm icon size từ 16px xuống 14px */}
        <input
          type="text"
          placeholder="Tìm thiết bị hoặc địa điểm..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "13px", // Giảm từ 14px xuống 13px
            color: "#1e293b",
            width: "100%",
            fontFamily: "inherit",
            fontWeight: "500",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setShowDropdown(false);
              setSearchedPoi(null);
            }}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "#94a3b8",
              padding: "0",
              lineHeight: 1,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#64748b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown kết quả */}
      {showPanel && (
        <div
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(12px)",
            borderRadius: "0 0 16px 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            overflow: "hidden",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            borderTop: "none",
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {searchLoading && !hasResults ? (
            <div
              style={{
                padding: "12px 14px",
                fontSize: "13px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #e2e8f0",
                  borderTopColor: "#12a1c0",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Đang tìm kiếm...
            </div>
          ) : hasResults ? (
            searchResults.map((poi, i) => {
              const cat = CATEGORY_MAP[
                poi.category as keyof typeof CATEGORY_MAP
              ] || {
                bg: "#083D77",
                icon: "📍",
                label: "Device",
              };
              return (
                <div
                  key={poi.id}
                  onMouseDown={() => handleSelectPoi(poi)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: cat.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {cat.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1e293b",
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {poi.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: "500",
                      }}
                    >
                      {cat.label || poi.category || ""}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "12px 14px",
                fontSize: "13px",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              Không tìm thấy kết quả
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
