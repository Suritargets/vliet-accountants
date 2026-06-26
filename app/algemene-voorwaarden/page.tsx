import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Algemene Voorwaarden | Vliet Accountants & Consultants" };

export default function AlgemeneVoorwaardenPage() {
  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">Juridisch</Badge>
          <h1 className="text-4xl font-bold mb-4">Algemene Voorwaarden</h1>
          <p className="text-white/75 text-lg">Laatst bijgewerkt: januari 2025</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10 text-gray-700 leading-relaxed">

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">1. Algemeen</h2>
              <p>
                Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, offertes en overeenkomsten van Vliet Accountants &amp; Consultants (hierna: &quot;Vliet&quot;), gevestigd te Wagenwegstraat 51, Suriname. Door gebruik te maken van onze diensten verklaart u zich akkoord met deze voorwaarden.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">2. Dienstverlening</h2>
              <p>
                Vliet verleent professionele diensten op het gebied van audit &amp; assurance, internal audit, accounting &amp; reporting, tax &amp; compliance, advisory &amp; training en transformation &amp; project management. Alle werkzaamheden worden uitgevoerd conform de geldende beroeps- en gedragsregels en de toepasselijke wet- en regelgeving.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">3. Offertes en overeenkomsten</h2>
              <p>
                Alle offertes van Vliet zijn vrijblijvend en geldig gedurende 30 dagen, tenzij anders vermeld. Een overeenkomst komt tot stand op het moment dat de opdrachtbevestiging door beide partijen is ondertekend, dan wel wanneer Vliet een begin maakt met de uitvoering van de werkzaamheden.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">4. Verplichtingen van de cliënt</h2>
              <p>De cliënt is verplicht:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Alle voor de uitvoering van de opdracht benodigde informatie tijdig en volledig aan te leveren</li>
                <li>Vliet te informeren over relevante wijzigingen in de bedrijfssituatie</li>
                <li>Mee te werken aan de uitvoering van de opdracht</li>
                <li>Betaling te voldoen conform de overeengekomen betalingstermijnen</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">5. Honorarium en betaling</h2>
              <p>
                Het honorarium wordt vastgesteld op basis van de bestede tijd, het gehanteerde uurtarief en/of een vaste prijs zoals overeengekomen in de opdracht. Facturen dienen te worden voldaan binnen 14 dagen na factuurdatum, tenzij schriftelijk anders overeengekomen. Bij niet-tijdige betaling is Vliet gerechtigd de werkzaamheden op te schorten.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">6. Geheimhouding</h2>
              <p>
                Vliet is verplicht tot geheimhouding van alle vertrouwelijke informatie die in het kader van de opdracht wordt verkregen. Deze geheimhoudingsplicht geldt niet indien Vliet op grond van een wettelijke bepaling of een rechterlijke uitspraak gehouden is de informatie te verstrekken.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">7. Aansprakelijkheid</h2>
              <p>
                De aansprakelijkheid van Vliet is beperkt tot het bedrag dat in het desbetreffende geval door de beroepsaansprakelijkheidsverzekering wordt uitgekeerd. Vliet is niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst. Vliet is evenmin aansprakelijk voor schade die voortvloeit uit onjuiste of onvolledige informatieverstrekking door de cliënt.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">8. Intellectueel eigendom</h2>
              <p>
                Alle door Vliet vervaardigde rapporten, adviezen en andere documenten zijn uitsluitend bestemd voor gebruik door de cliënt in het kader van de opdracht. Het is de cliënt niet toegestaan deze stukken zonder schriftelijke toestemming van Vliet aan derden te verstrekken of openbaar te maken.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">9. Opzegging</h2>
              <p>
                Zowel de cliënt als Vliet kan de overeenkomst schriftelijk opzeggen met inachtneming van een opzegtermijn van 30 dagen. Vliet behoudt in dat geval het recht op vergoeding van reeds verrichte werkzaamheden.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">10. Toepasselijk recht en geschillen</h2>
              <p>
                Op alle overeenkomsten tussen Vliet en de cliënt is het recht van Suriname van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Suriname, tenzij partijen overeenkomen het geschil te beslechten via arbitrage of mediation.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">11. Wijzigingen</h2>
              <p>
                Vliet behoudt zich het recht voor deze algemene voorwaarden te wijzigen. De meest actuele versie is beschikbaar op onze website. Bij wijziging van de voorwaarden worden cliënten hiervan op de hoogte gesteld.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-3">12. Contact</h2>
              <p>
                Voor vragen over deze algemene voorwaarden kunt u contact opnemen via:<br />
                <a href="mailto:info@vlietaccountants.com" className="text-gold hover:underline">info@vlietaccountants.com</a> | +597 720 2090
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
