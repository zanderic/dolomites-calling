# Dolomites Calling
Dolomites Calling è un'applicazione web per la pianificazione di escursioni tra le montagne delle Dolomiti Bellunesi, basata su SPARQL e RDF.

### Test del progetto
Per utilizzare il programma è stato utilizzato Apache Jena Fuseki, sul quale sono stati caricati i dati necessari per l'utilizzo dell'applicazione, ovvero l'ontologia modificata e il database delle features.

_Lo SPARQL server non è incluso in questa repo_.

## Tecnologie
L'applicativo si basa su GeoNames, un'ontologia affermata e molto diffusa per la classificazione di punti nello spazio, e fa uso delle tecnologie SPARQL e RDF per il recupero e la gestione dei dati.
Lo scopo del progetto è stato quello di studiare ed ampliare l'ontologia appena presentata, per renderla maggiormente adatta a classificare i sentieri di montagna.

## Modifica di GeoNames
Per ottenere il risultato è stata modificata l'ontologia andando ad ampliare la definizione di sentiero (trail, classificato con codice R:TRL) cercando di descriverlo con delle proprietà ulteriori, come difficoltà, dislivello, tempo di percorrenza e crocevia incontrati.
È stato inoltre aggiunto il punto di tipo R.TRLSTR, ovvero "punto di partenza di un sentiero", anche questo caratterizzato da latitudine, longitudine e, dove possibile, altitudine.
Questa aggiunta è stata fatta per andare a definire con maggiore precisione un'entità che non si caratterizza da un solo punto, ma che rappresenta un percorso su una mappa.

## Funzionalità
Attraverso l'interfaccia creata è possibile visualizzare le montagne, i rifugi e i laghi che popolano le Dolomiti bellunesi. Successivamente, in base al proprio gusto, si può ottenere l'elenco dei sentieri che raggiungono o portanto al luogo che si vuole visitare.
Ogni sentiero è dotato di un'elenco dei crocevia che si incontrano, si può quindi navigare facilmente da un sentiero all'altro pianificando dei possibili cambi di itinerario.
Infine, è possibile consultare tutti i sentieri inseriti nel database, oppure filtrarli per ore di percorrenza medie.

## Fonti
Per lo scopo del progetto mi sono limitato ad utilizzare il sito del CAI sezione di Auronzo di Cadore (www.caiauronzo.it), comprendente un totale di 39 sentieri dislocati sul territorio della Comunità Montana di Auronzo.
Altre fonti utili: http://www.paesaggiodolomitico.it/sito/node/116.

## Miglioramenti
- Sostituire Google Maps con Open Maps. Queste ultime presentano un grado di dettaglio molto maggiore ai fini dello scopo dell'applicazione. Sono visualizzati e segnati i sentieri completi di percorso e numerazione, oltre ai crocevia, che sono stati impossibili da localizzare utilizzando le mappe di Google.
- Modificare la proprietà dei sentieri "travelTime" andando a indicare solamente il numero delle ore di percorrenza, eliminando la notazione "h". Quando sono stati aggiunti i tasti per la ricerca dei sentieri basata sulle ore di percorrenza, è stato impossibile fare una selezione preventiva con una query apposita perchè il dato non è stato inserito solamente con il numero, rendendo impossibile quindi un confronto maggiore/minore.
- Filtro degli orario modificabile in libertà con un menù a tendina.
- Aggiungere filtro delle difficoltà.


> Progetto di INTELLIGENZA ARTIFICIALE, RAPPRESENTAZIONE DELLA CONOSCENZA<br>Riccardo Zandegiacomo De Lugan<br>Università di Bologna, CdLM in Informatica<br>A.S. 2017/2018, Novembre 2017
