import React from 'react';
import styles from './EquipmentReceiptPrint.module.css';
import logoImage from '../img/logo.png';

export default function EquipmentReceiptPrint({ client, equipment, orderNumber }) {
  const formatDate = (date) => {
    const dateObj = date ? new Date(date) : new Date();
    const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const dayName = days[dateObj.getDay()];
    return `${day} ${month} ${year}, ${dayName}`;
  };

  const getEquipmentType = () => {
    const parts = [];
    if (equipment.manufacturer) parts.push(equipment.manufacturer);
    if (equipment.model) parts.push(equipment.model);
    if (equipment.equipment_type && !parts.length) parts.push(equipment.equipment_type);
    return parts.join(' ') || equipment.equipment_type || '-';
  };

  return (
    <div className={styles.printContainer}>
      <div className={styles.header}>
        <div className={styles.logoTopLeft}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoImage.src || logoImage}
            alt="IT-PREMIUM Logo"
            className={styles.logoImage}
          />
        </div>
        <div className={styles.companyInfo}>
          <p>IT-PREMIUM Centrum Serwisowe</p>
          <p>os. Jana III Sobieskiego 41F 60-688 Poznań</p>
          <p>tel.: 784 784 957</p>
        </div>
      </div>

      <div className={styles.title}>
        <h2>Potwierdzenie przyjęcia sprzętu na serwis</h2>
        <p className={styles.receiptNumber}>numer {orderNumber}</p>
      </div>

      <div className={styles.repairInfoSection}>
        <h3>Informacje o naprawie</h3>
        <div className={styles.repairInfo}>
          <p><strong>Zlecający:</strong> {client?.name || '-'}</p>
          <p><strong>Dane kontaktowe:</strong> tel.:{client?.phone ? (client.phone.startsWith('+48') ? ` ${client.phone}` : ` +48 ${client.phone}`) : '-'}{client?.email ? ` ${client.email}` : ''}</p>
          <p><strong>Data przyjęcia:</strong> {formatDate(equipment.created_at || new Date())}</p>
          <p><strong>Rodzaj:</strong> {getEquipmentType()}</p>
          <p><strong>Numer seryjny:</strong> {equipment.serial_number || '-'}</p>
          <p><strong>Sposób odbioru:</strong> Osobiście</p>
          <p><strong>Zasilacz w zestawie:</strong> {equipment.power_adapter_included ? 'Tak' : 'Nie'}</p>
          <p><strong>Kopia danych:</strong> {equipment.data_backup_requested ? 'Tak' : 'Nie'}</p>
        </div>
      </div>

      <div className={styles.issueSection}>
        <h3>Opis usterki</h3>
        <div className={styles.issueDescription}>
          {equipment.issue_description || '-'}
        </div>
      </div>

      <div className={styles.regulationsSection}>
        <h3>Regulamin Serwisu</h3>
        <h4>Regulamin świadczenia usługi serwisowej</h4>
        <ol className={styles.regulationsList}>
          <li>Klient zleca a IT-PREMIUM Centrum Serwisowe (dalej: Wykonawca) zobowiązuje się podjąć działania zmierzające do zdiagnozowania oraz usunięcia zgłoszonych nieprawidłowości w działaniu sprzętu lub dokonania określonych działań (m.in. instalacji/konfiguracji/odzyskiwania danych) zgodnie z ustaleniami stron.</li>
          <li>O ile diagnoza nie jest możliwa bezpośrednio w trakcie wstępnych oględzin sprzętu — Serwis zobowiązuje się poinformować o możliwości naprawy i kosztach w ciągu 7 dni roboczych od przyjęcia sprzętu. Jeżeli w toku diagnozy ujawnią się nieoczekiwane okoliczności wymagające dalszej diagnozy, wykonawca przed upływem wyżej wymienionego terminu poinformuję zlecającego o nowym terminie planowanej diagnozy.</li>
          <li>Czas naprawy wynosi do 7 dni roboczych od dnia akceptacji zakresu naprawa ustalonego w toku diagnozy. Czas naprawy uwarunkowany możliwością uzyskania odpowiednich części niezbędnych do naprawy — w związku z tym, czasu w którym Wykonawca oczekuje na dostarczenie części nie wlicza się do czasu naprawy.</li>
          <li>Realizacji usługi może wiązać się z ryzykiem utraty danych na przekazanych urządzeniach, w związku z powyższym Klient zobowiązany jest przed wydaniem sprzętu Wykonawcy wykonać we własnym zakresie kopie zapasowe wszystkich danych (w szczególności plików, multimediów, dokumentów, zdjęć, aplikacji, certyfikatów, plików źródłowych) zgromadzonych na przekazywanym urządzeniu. Klient oświadcza, iż przekazując sprzęt – dokonał powyższej czynności i dysponuje kopiami zapasowymi.</li>
          <li>Zlecający naprawę wyraża zgodę na transport sprzętu, w tym wysyłkę przez przewoźnika. Wykonawca może wykonywać usługę przy pomocy podmiotów trzecich.</li>
          <li>Jeżeli w wyniku wykonywania naprawy, Wykonawca ustali, iż niezbędne są inne prace, brak których może wpływać na późniejszy rezultat zleconych prac, poinformuje on o tym fakcie oraz ryzykach Klienta. Strony podejmą ustalenia co do realizacji tych działań samodzielnie przez Klienta lub rozszerzenie zakresu zlecenia. Klient może również wydać dyspozycję realizacji prac bez uprzedniej realizacji prac dodatkowych, przez co akceptuje możliwość wystąpienia ryzyk o których został poinformowany.</li>
          <li>Jeżeli do wykonania usługi potrzebne jest współdziałanie zamawiającego, a tego współdziałania brak, przyjmujący zamówienie może wyznaczyć zamawiającemu odpowiedni termin z zagrożeniem, iż po bezskutecznym upływie wyznaczonego terminu będzie uprawniony do odstąpienia od umowy.</li>
          <li>Strony mogą ustalić pozostawienie zdemontowanych podzespołów w rozliczeniu Wykonawcy. Z chwilą odbioru sprzętu — Klient przenosi prawo własności ww. elementów na Wykonawcę.</li>
          <li>O ile Gwarant nie wskazał dłuższego czasu na naprawę udziela się 3 miesięcy gwarancji. Gwarancja obejmuje wyłącznie zakres dokonywanych napraw. Gwarancja jest wydłużana o czas jaki sprzęt przebywa w serwisie w czasie napraw gwarancyjnych.</li>
          <li>Klient przyjmuje do wiadomości oraz akceptuje, iż:
            <ol type="a">
              <li>w związku z różnymi parametrami montowanych podzespołów w wyniku naprawy może dojść do zmiany parametrów sprzętu, w szczególności szybkości reakcji/pracy poszczególnych podzespołów i oprogramowania;</li>
              <li>w toku diagnozy, w szczególności w przypadku ustalenia braku możliwości naprawy, może dojść do uszkodzeń podzespołów sprzęt (w tym również innych, niż pierwotna przyczyna usterki); Powyższe wynika to w szczególności ze stosowanej technologii układów BGA oraz złożoności diagnozowanych urządzeń (np. niedostępności poszczególnych elementów urządzenia);</li>
            </ol>
          </li>
          <li>Uprawnienia z tytułu gwarancji nie obejmują prawa zleceniodawcy do domagania się zwrotu utraconych zysków w czasie trwania naprawy gwarancyjnej.</li>
          <li>Wykonawca informuje Klienta o zakończeniu naprawy. Klient zobowiązuje się zapłacić wynagrodzenie z tytułu zleconych prac, a także odebrać pozostawiony sprzęt w terminie 7 dni od dnia powiadomienia.</li>
          <li>Wykonawca uprawniony jest do zatrzymania sprzętu aż do chwili uiszczenia przez Klienta należności wynikających z niniejszej umowy.</li>
          <li>Po upływie 7 dni od poinformowania klienta o zakończeniu naprawy sprzętu naliczana jest opłata magazynowa w wysokości 10 zł dziennie, którą Klient zobowiązany jest uiścić.</li>
          <li>W przypadku Klienta nie będącego konsumentem w rozumieniu art. 22(1) k.c. — Wykonawca odpowiada wobec Klienta do wysokości faktycznie poniesionych strat, przy czym całkowita łączna odpowiedzialność Wykonawcy z jakiegokolwiek tytułu w ramach niniejszej umowy ograniczona jest do wysokości stanowiącej ustalone wynagrodzenie. Odpowiedzialność z tytułu utraconych korzyści, szkód pośrednich, z tytułu rękojmi oraz za szkody inne niż wyrządzone umyślnie — wyłączona.</li>
          <li>W przypadku niezgody na naprawę komputera stacjonarnego i/lub drukarki pobierana jest opłata diagnostyczna w wysokości 100 zł brutto.</li>
          <li>Użytkownik przekazujący sprzęt do serwisu w celu dokonania naprawy akceptuje powyższe warunki.</li>
        </ol>
      </div>

      <div className={styles.consumerInfoSection}>
        <h3>Pouczenie konsumenckie</h3>
        <p>W przypadku umów zawieranych na odległość lub poza lokalem przedsiębiorstwa:</p>
        <p>Konsumentowi przysługuje uprawnienie do odstąpienia od umowy w terminie 14 dni od dnia jej zawarcia. Konsument może złożyć oświadczenie o odstąpieniu listownie, drogą elektroniczną. Może, lecz nie jest to niezbędne skorzystać z wzoru formularza odstąpienia od umowy, zawartym w załączniku nr 2 do ustawy o prawach konsumenta. W przypadku odstąpienia od umowy zawartej na odległość lub umowy zawartej poza lokalem przedsiębiorstwa umowę uważa się za niezawartą.</p>
        <p>Jeżeli konsument wykonuje prawo odstąpienia od umowy po zgłoszeniu żądania zgodnie z art. 15 ust. 3 i art. 21 ust. 2, ma obowiązek zapłaty za świadczenia spełnione do chwili odstąpienia od umowy.</p>
        <p>Prawo odstąpienia od umowy zawartej poza lokalem przedsiębiorstwa lub na odległość nie przysługuje konsumentowi w odniesieniu do umowy o świadczenie usług, jeżeli przedsiębiorca wykonał w pełni usługę za wyraźną zgodą konsumenta, który został poinformowany przed rozpoczęciem świadczenia, że po spełnieniu świadczenia przez przedsiębiorcę utraci prawo odstąpienia od umowy.</p>
      </div>

      <div className={styles.rodoSection}>
        <h3>RODO</h3>
        <ol className={styles.rodoList}>
          <li>Administratorem Państwa danych osobowych jest IT-PREMIUM Mariusz Łubianka.</li>
          <li>Kontakt z Administratorem danych osobowych możliwy jest w formie pisemnej, jak również z wykorzystaniem środków porozumiewania się na odległość pod adresem poczty elektronicznej: biuro@it-premium.pl</li>
          <li>Państwa dane osobowe są przetwarzane w celu realizacji umowy (art. 6 ust. 1 lit. b RODO) oraz wypełniania obowiązków prawnych ciążących na (art. 6 ust. 1 lit. c RODO) oraz dochodzenia i obrony przed roszczeniami (art. 6 ust. 1 lit. f RODO)</li>
          <li>Kategorie przetwarzanych danych obejmują dane zawarte w powyższym zgłoszeniu oraz przekazane dane na nośnikach danych.</li>
          <li>Kategoria podmiotów potencjalnych odbiorców danych osobowych stanowią podmioty niezbędne w procesie:
            <ol type="a">
              <li>realizacji usługi: podwykonawców, przewoźników;</li>
              <li>wypełniania obowiązków prawnych oraz dochodzenia i obrony roszczeń: organy administracji publicznej, w tym Sądy, komornicy sądowi, notariusze, a ponadto kancelarie prawne, adwokackie i radcowskie, biura informacji gospodarczej, biura rachunkowe i księgowe.</li>
            </ol>
          </li>
          <li>Informuje, iż przysługuje państwu prawo do żądania od administratora dostępu do danych osobowych, które Pani/Pana dotyczą, ich sprostowania, usunięcia lub ograniczenia przetwarzania, prawo do wniesienia sprzeciwu wobec przetwarzania, wycofania zgody na przetwarzanie danych osobowych, przenoszenia danych osobowych jak również prawo do wniesienia skargi do organu nadzorczego.</li>
          <li>Państwa dane osobowe będą przetwarzane przez okres 6 lat, licząc od końca roku kalendarzowego w którym doszło do zakończenia realizacji usługi.</li>
        </ol>
      </div>

      <div className={styles.confirmationBox}>
        <p>Potwierdzam, że dane kontaktowe oraz informacje o naprawie są zgodne z ustaleniami i akceptuję regulamin serwisu oraz RODO.</p>
      </div>

      <div className={styles.signatureSection}>
        <div className={styles.signatureLine}></div>
        <p className={styles.signatureLabel}>Podpis klienta</p>
      </div>
    </div>
  );
} 