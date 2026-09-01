const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon size={22} />
        </div>
      </div>

      <p>{title}</p>

      <h3>{value}</h3>

      {description && (
        <span>
          {description}
        </span>
      )}
    </div>
  );
};

export default StatCard;
