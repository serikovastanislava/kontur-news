
export default function NewsletterWidget() {
  return (
    <section className="widget newsletter">
      <h3>Рассылка</h3>
      <p>Главные новости недели<br />на вашу почту.</p>
      <div>
        <input placeholder="Введите ваш email" />
        <button>→</button>
      </div>
    </section>
  );
}