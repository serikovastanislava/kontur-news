import { Quote, ArrowRight, Play } from 'lucide-react';

const editorials = ['Почему важно инвестировать в образование','Как технологии меняют журналистику','Энергетический переход: вызовы и решения'];
const rankings = ['ЦБ сохранил ключевую ставку на уровне 16%','Россия укрепляет сотрудничество с дружественными странами','Что будет с ценами на нефть в 2025 году','Как защитить персональные данные в цифровую эпоху','Новые технологии изменят рынок труда'];

export default function Editorial() {
  return (
    <section className="editorial section">
      <div className="editor-box">
        <h2>Мнение редакции</h2>
        <div className="editor-feature">
          <div className="editor-portrait" />
          <div><Quote size={16}/><h3>Сегодня мир находится на переломном этапе. Важно не только следить за событиями, но и понимать их суть.</h3><p>Анна Родионова<br/><small>Главный редактор</small></p></div>
        </div>
        {editorials.map(x => <div className="mini-link" key={x}>{x}<ArrowRight size={12}/></div>)}
      </div>
      <div className="rank-box"><h2>Главное</h2>{rankings.map((x,i)=><div className="rank" key={x}><b>0{i+1}</b><span>{x}<small>{i+2} часа назад</small></span></div>)}</div>
      <div className="media-box">
        <h2>Мультимедиа</h2>
        <div className="video-card"><div className="video-art"/><span className="play"><Play size={15} fill="currentColor"/></span><em>04:32</em></div>
        <h3>Новый этап: запуск спутника связи</h3><small>Как это повлияет на развитие технологий и жизнь людей.</small>
      </div>
    </section>
  );
}
