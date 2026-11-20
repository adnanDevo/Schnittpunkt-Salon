# Anforderungsliste – Friseursalon Schnittpunkt

Grundlage ist das Gesprächsprotokoll mit der Inhaberin. Priorität nach MoSCoW: **Muss**, **Kann**.
Status: ✅ umgesetzt · 🟡 teilweise umgesetzt · ❌ nicht umgesetzt

## F – Funktionale Anforderungen

| ID | Anforderung | Fundstelle im Protokoll | Prio | Status | Umsetzung |
|---|---|---|---|---|---|
| F-01 | Kundinnen und Kunden buchen online selbst einen Termin. | „im Internet selbst einen Termin buchen“ | Muss | ✅ | `buchung.html`, `POST /api/termin` |
| F-02 | Bei der Buchung wählt man Leistung, Person oder „egal“, Datum und Uhrzeit. | „viele wollen zu Mara oder zu Jonas“ | Muss | ✅ | `buchung.html`: Schritte 1 bis 3 |
| F-03 | Bei „egal“ wird automatisch eine freie Person zugewiesen, die die Leistung ausführen kann. | „dann nimmt die Anwendung jemanden, der frei ist“ | Muss | ✅ | Erste freie Person nach ID, `terminMitTransaktionSpeichern` |
| F-04 | Kunden geben Name, Telefonnummer und E-Mail an, ein Konto ist nicht nötig. | „Name, Telefonnummer und E-Mail. Ein Konto mit Passwort will keiner“ | Muss | ✅ | Buchungsformular ohne Konto |
| F-05 | Bekannte Kunden werden wiedererkannt, ihre Daten bleiben gespeichert. | „nicht alles neu tippen müssen“ | Muss | ✅ | Frage „Waren Sie schon einmal bei uns?“, Wiedererkennung über die E-Mail |
| F-06 | Kunden können ohne Login stornieren, aber nur ihre eigenen Termine. | „Ohne Login, aber so, dass nicht jeder fremde Termine löschen kann“ | Muss | ✅ | Zufälliger Stornocode (UUID) pro Termin, `stornieren.html`, `POST /api/termin/storno` |
| F-07 | Der Salon kann jeden Termin jederzeit stornieren. | „Ich selbst muss jeden Termin jederzeit stornieren können“ | Muss | ✅ | `salon.html`: Knopf „Stornieren“, ohne 24-Stunden-Frist |
| F-08 | Stornierte Termine bleiben gespeichert und tragen einen Status. | „Die Termine will ich nicht löschen“ | Muss | ✅ | Spalte `termin_status`, kein Löschen von Terminen |
| F-09 | Der Salon markiert einen Termin als erledigt. | „wenn jemand da war, hake ich das ab“ | Muss | ✅ | `salon.html`: „Erledigt“, zusätzlich „Nicht erschienen“ |
| F-10 | Der Salon sieht eine Tagesübersicht mit Zeit, Leistung, Kunde und Telefonnummer, eine Spalte pro Person, und blättert zwischen Tagen. | „Ein Tag auf einen Blick“, „pro Mitarbeiter eine Spalte“ | Muss | ✅ | `salon.html`, `GET /api/termin/tag?datum=` |
| F-11 | Der Salon legt Leistungen an und ändert Preise. | „das möchte ich selbst anpassen können“ | Muss | ✅ | `salon.html`, Reiter „Leistungen“: anlegen, Preis und Dauer ändern, aktiv/inaktiv |

## R – Regeln und Einschränkungen

| ID | Anforderung | Fundstelle im Protokoll | Prio | Status | Umsetzung |
|---|---|---|---|---|---|
| R-01 | Eine Person hat zur selben Zeit höchstens einen Termin, Doppelbuchungen sind ausgeschlossen. | „denselben Termin zweimal vergeben“, „jede Person nur einen Termin gleichzeitig“ | Muss | ✅ | Transaktion mit Zeilensperre (`FOR UPDATE`) und Überschneidungsprüfung beim Speichern |
| R-02 | Die Dauer der Leistung bestimmt, wie lange die Person belegt ist. | Leistungsliste mit Minuten | Muss | ✅ | Ende = Beginn + `dauer_in_minuten` aus der Datenbank |
| R-03 | Termine beginnen im 15-Minuten-Raster. | „im Viertelstundentakt“ | Muss | ✅ | Zeitraster im Frontend, Prüfung `istImRaster` im Backend |
| R-04 | Ein Termin liegt komplett in den Öffnungszeiten (Di bis Fr 9 bis 18 Uhr, Sa 9 bis 14 Uhr, Mo und So geschlossen). | „Ein Termin muss komplett in die Öffnungszeit passen“ | Muss | ✅ | Tabelle `oeffnungstag`, Prüfung `liegtInOeffnungszeit` |
| R-05 | Nur Personen, die die Leistung anbieten, sind wählbar. Sabine und Mara: alle sechs Leistungen. Jonas: Herrenschnitt, Waschen & Föhnen, Kinderschnitt und Bartpflege; kein Damenschnitt und kein Färben. | „sonst bucht jemand Färben bei Jonas“; Gespräch zur Aufgabenverteilung; Leistungsübersicht des Dozenten | Muss | ✅ | Tabelle `mitarbeiter_leistung`, nicht passende Personen sind auf der Buchungsseite gesperrt |
| R-06 | Buchbar ist nichts in der Vergangenheit, mit mindestens 2 Stunden Vorlauf und höchstens 3 Monate im Voraus. | „Nichts in der Vergangenheit“, „mindestens zwei Stunden vorher“, „drei Monate reichen“ | Muss | ✅ | Prüfung `pruefeBuchungszeit` |
| R-07 | Kunden stornieren bis 24 Stunden vor Beginn selbst, danach nur der Salon. | „Bis 24 Stunden vorher …, danach nur über mich“ | Muss | ✅ | Prüfung in `stornierenPerCode`, Hinweis auf telefonische Absage |

## N – Nicht-funktionale Anforderungen

| ID | Anforderung | Fundstelle im Protokoll | Prio | Status | Umsetzung |
|---|---|---|---|---|---|
| N-01 | Der Salon-Bereich ist durch ein gemeinsames Passwort geschützt. | „ein Passwort für mich und das Team reicht“ | Muss | ✅ | Middleware `salonAuth`, Passwort in der `.env` (`SALON_PASSWORT`), Header `x-salon-passwort` |
| N-02 | Die Buchungsseite zeigt keine Daten anderer Kunden, nur frei oder belegt. | „darf niemand sehen, wer sonst noch gebucht hat“ | Muss | ✅ | Öffentliche Routen liefern nur freie Uhrzeiten, Kunden- und Terminlisten sind geschützt |
| N-03 | Die Buchung ist jederzeit möglich, auch abends. | „auch abends um zehn“ | Muss | ✅ | Online-Buchung rund um die Uhr |

## W – Wünsche (Bonus)

| ID | Anforderung | Fundstelle im Protokoll | Prio | Status | Umsetzung |
|---|---|---|---|---|---|
| W-01 | Bestätigungs-E-Mail nach der Buchung. | „Schön wäre eine Bestätigungs-E-Mail“ | Kann | ❌ | Nicht umgesetzt. Der Stornocode wird nach der Buchung auf der Seite angezeigt. |
| W-02 | Mehrere Leistungen in einem Termin, zum Beispiel Schnitt und Bart. | „Schnitt und Bart in einem Termin“ | Kann | ❌ | Nicht umgesetzt, ein Termin hat genau eine Leistung. |
| W-03 | Freie Tage pro Person. Ergänzung: Lena beginnt im Januar und arbeitet im ersten Monat nur dienstags. | „freie Tage pro Person wäre gut“; „Lena, die ab Januar bei uns anfängt, ist im ersten Monat nur dienstags da“ | Kann | 🟡 | Tabelle `freietagen`: wöchentlich wiederkehrende freie Tage werden bei den freien Zeiten und beim Buchen berücksichtigt. Eine zeitliche Begrenzung („im ersten Monat“) gibt es nicht. |

## Bewusst nicht umgesetzt

- Die Meldung zur Kaffeemaschine gehört nicht zur Terminbuchung. Die Tabelle `meldung` und ihre Routen sind vorhanden, aber nicht Teil des Auftrags und ohne Oberfläche.
