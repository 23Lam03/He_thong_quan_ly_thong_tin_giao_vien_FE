/**
 * Header trang dạng editorial: eyebrow + tiêu đề có nhấn + dẫn chữ + dải số liệu.
 * Chỉ thuần trình bày — không chứa logic nghiệp vụ.
 */
function PageHeader({ eyebrow, title, accent, lede, meta = [] }) {
  return (
    <div className="page-head">
      {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}

      <h1 className="page-title">
        {title}
        {accent && <span className="accent">{accent}</span>}
      </h1>

      {lede && <p className="page-lede">{lede}</p>}

      {meta.length > 0 && (
        <div className="page-meta">
          {meta.map((item) => (
            <div className="meta-item" key={item.label}>
              <span className="meta-value">{item.value}</span>
              <span className="meta-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
