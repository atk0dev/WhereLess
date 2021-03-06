import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

// debugger;
// console.log('JS app started');

autocomplete($('#address'), $('#lat'), $('#lng'));

typeAhead($('.search'), 'search', null, 'store');
typeAhead($('.storelookup'), 'storelookup', 'storelookup__selected', 'store');
typeAhead($('.itemlookup'), 'itemlookup', 'itemlookup__selected', 'item');

makeMap($('#map'));

const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);