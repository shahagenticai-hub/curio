export default function ResourceCard({ resource }) {
  return (
    <a className="resource-card" href={resource.url} target="_blank" rel="noreferrer">
      {resource.thumbnail && <img src={resource.thumbnail} alt="" />}
      <div>
        <div className="r-title">{resource.title}</div>
        <div className="r-channel">{resource.channelTitle}</div>
      </div>
    </a>
  );
}
