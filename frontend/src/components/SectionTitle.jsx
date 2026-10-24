// Small tag + title used at the top of each section.
export default function SectionTitle({ tag, title, center = true }) {
  return (
    <div className={center ? "mb-10 text-center" : "mb-10"}>
      {tag && (
        <p className="mb-2 text-sm font-bold tracking-widest text-tealDark">
          {tag}
        </p>
      )}
      <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
    </div>
  );
}
