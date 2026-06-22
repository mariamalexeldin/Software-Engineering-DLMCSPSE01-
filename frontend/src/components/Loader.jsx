export default function Loader({ label = "Loading" }) {
  return (
    <div className="loader-wrap" role="status">
      <span className="loader" />
      <span>{label}</span>
    </div>
  );
}

