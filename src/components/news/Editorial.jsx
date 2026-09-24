import { ArrowRight } from 'lucide-react';
import { useApp } from '../../state/store';
import CatMultiplayer from './CatMultiplayer';

const editorialThemes = [
  {
    id: 'editorial-education',
    category: 'Мнение',
    title: 'Образование как инфраструктура будущего',
    topic: 'Почему важно инвестировать в образование',
    body: 'Качество образования влияет не только на результаты отдельных людей, но и на способность общества адаптироваться к технологическим и экономическим изменениям. Инвестиции в подготовку учителей, доступ к современным материалам и развитие прикладных навыков создают основу для долгосрочного роста.',
  },
  {
    id: 'editorial-journalism',
    category: 'Мнение',
    title: 'Как технологии меняют журналистику',
    topic: 'Как технологии меняют журналистику',
    body: 'Новые инструменты ускоряют поиск, обработку и визуализацию информации, но не отменяют редакционную проверку. Для современной журналистики особенно важны прозрачность источников, отделение фактов от интерпретаций и понятное объяснение сложных событий читателю.',
  },
  {
    id: 'editorial-energy',
    category: 'Мнение',
    title: 'Энергетический переход: вызовы и решения',
    topic: 'Энергетический переход: вызовы и решения',
    body: 'Энергетический переход связан одновременно с технологиями, инвестициями, инфраструктурой и стоимостью энергии. Среди практических вопросов — обновление сетей, развитие накопителей, повышение эффективности и поиск баланса между надёжностью энергоснабжения и снижением выбросов.',
  },
];

export default function Editorial() {
  const { t, openModal } = useApp();

  return (
    <section className="editorial section">
      <div className="editor-box">
        <h2>{t('Мнение редакции')}</h2>
        <div className="editorial-list">
          {editorialThemes.map(article => (
            <button
              className="mini-link editorial-link"
              key={article.id}
              onClick={() => openModal('article', {
                id: article.id,
                category: article.category,
                title: article.title,
                excerpt: `${article.topic}. ${article.body}`,
                author: 'Редакция «Контур»',
              })}
            >
              <span>
                <b>{t(article.title)}</b>
              </span>
              <ArrowRight size={12} />
            </button>
          ))}
        </div>
      </div>

      <div className="media-box">
        <h2>{t('Мультимедиа')}</h2>
        <CatMultiplayer />
      </div>
    </section>
  );
}
