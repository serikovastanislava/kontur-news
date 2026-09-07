import { Radio } from "lucide-react";

export default function LiveWidget() {
  return (
    <section className="widget live-widget">
      <div className="live-title">
        <Radio size={17} />
        <b>Лента новостей / Live</b>
      </div>
      <p>Актуальные события<br />в реальном времени</p>
      <button>▶</button>
      <div className="live-ring" />
    </section>
  );
}