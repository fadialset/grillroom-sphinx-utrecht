# Afbeeldingen Directory

Deze map is bedoeld voor de menu item afbeeldingen van Grillroom Sphinx Utrecht.

## 📁 Bestandsstructuur

Voeg afbeeldingen toe met de exacte bestandsnamen zoals gespecificeerd in `menu.json`:

### Broodjes
- `broodje-shoarma.jpg`
- `broodje-kipfilet.jpg`
- `broodje-shoarma-kaas.jpg`
- `broodje-kipfilet-kaas.jpg`
- `broodje-sphinx.jpg`
- `broodje-sjasliek.jpg`
- `broodje-kebab.jpg`
- `broodje-hamburger.jpg`
- `broodje-falafel.jpg`
- `broodje-lamsvlees.jpg`
- `broodje-gezond.jpg`
- `broodje-kaas.jpg`
- `broodje-ei.jpg`
- `turkse-pizza.jpg`
- `turkse-pizza-kaas.jpg`
- `turkse-pizza-shoarma.jpg`

### Kapsalon
- `kapsalon-shoarma.jpg`
- `kapsalon-kip.jpg`
- `kapsalon-lamsvlees.jpg`

### Schotels
- `shoarmaschotel.jpg`
- `kipfilet-schotel.jpg`
- `sjasliek-schotel.jpg`
- `kebab-schotel.jpg`
- `hamburger-royal.jpg`
- `ramses-schotel.jpg`
- `amon-schotel.jpg`
- `kebab-sjasliek-schotel.jpg`
- `spaghetti-amatrice.jpg`
- `cairo-schotel.jpg`
- `sphinx-special.jpg`
- `lamskoteletten-schotel.jpg`
- `lamsshoarma-schotel.jpg`
- `lamsshoarma-schotel-kaas.jpg`
- `mix-grill-dish.jpg`
- `falafel-schotel.jpg`

### Extra's
- `franse-friet.jpg`
- `groene-salade.jpg`
- `pitabrood.jpg`
- `extra-vlees.jpg`

### Sauzen
- `knoflooksaus.jpg`
- `uiensaus.jpg`
- `cocktailsaus.jpg`
- `sambal.jpg`
- `tomatensaus.jpg`
- `ketchup.jpg`
- `mayonaise.jpg`

### Dranken
- `coca-cola.jpg`
- `coca-cola-zero.jpg`
- `fanta-orange.jpg`
- `aa-drink.jpg`
- `sprite.jpg`
- `chocomel.jpg`
- `cassis.jpg`
- `mangosap.jpg`
- `fernandes-cherry.jpg`
- `fernandes-green.jpg`
- `spa-blauw.jpg`
- `spa-rood.jpg`
- `dr-pepper.jpg`
- `ice-tea.jpg`
- `ice-tea-green.jpg`
- `red-bull.jpg`
- `schweppes-bitter.jpg`

## 📐 Aanbevolen Specificaties

- **Formaat**: JPG of PNG
- **Resolutie**: Minimaal 300x300 pixels
- **Aspectratio**: 1:1 (vierkant) of 4:3 (landschap)
- **Bestandsgrootte**: Max 500KB per afbeelding
- **Kwaliteit**: Hoge kwaliteit, goed belichte foto's

## 🔧 JavaScript Aanpassing

Om afbeeldingen te activeren, uncomment de volgende regels in `script.js`:

```javascript
// Vervang dit:
const image = document.createElement('div');
image.className = 'item-image';
image.textContent = 'Afbeelding niet beschikbaar';

// Met dit:
const image = document.createElement('img');
image.className = 'item-image';
image.src = item.image;
image.alt = item.name;
image.onerror = function() {
    this.style.display = 'none';
};
```

## 📷 Fotografie Tips

1. **Goede belichting**: Gebruik natuurlijk licht wanneer mogelijk
2. **Styling**: Zorg voor aantrekkelijke presentatie van het eten
3. **Achtergrond**: Gebruik een neutrale, schone achtergrond
4. **Hoek**: Fotografeer vanuit een aantrekkelijke hoek (45° of van bovenaf)
5. **Focus**: Zorg dat het eten scherp en in focus is

---

*Voor vragen over fotografie of beeldbewerking, neem contact op met het ontwikkelteam.* 