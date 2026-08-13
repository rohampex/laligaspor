(async function () {
  await LLbackend.getSettings();
  LLutil.layout();
  const { I, el } = LLutil;
  const s = LL.getSettings();
  const items = [
    { icon: I.mappin, title: 'آدرس فروشگاه', value: s.address },
    { icon: I.phone, title: 'تلفن و واتساپ', value: `<span dir="ltr">${s.whatsapp}</span>` },
    { icon: I.mail, title: 'ایمیل پشتیبانی', value: `<span dir="ltr">${s.contactEmail}</span>` },
    { icon: I.clock, title: 'ساعات کاری', value: s.businessHours }
  ];
  const wrap = document.getElementById('contact-info');
  items.forEach(it => wrap.append(el(`
    <div class="contact-item">
      <div class="icon-wrap">${it.icon}</div>
      <div><h3>${it.title}</h3><p>${it.value}</p></div>
    </div>
  `)));

  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    LLutil.toast('پیام ارسال شد', 'پیام شما با موفقیت دریافت شد. به زودی با شما تماس خواهیم گرفت.');
    e.target.reset();
  });
})();
