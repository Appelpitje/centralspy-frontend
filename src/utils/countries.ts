export interface Country {
  code: string;
  name: string;
}

const RAW = `
AF|Afghanistan
AX|Åland Islands
AL|Albania
DZ|Algeria
AS|American Samoa
AD|Andorra
AO|Angola
AI|Anguilla
AQ|Antarctica
AG|Antigua and Barbuda
AR|Argentina
AM|Armenia
AW|Aruba
AU|Australia
AT|Austria
AZ|Azerbaijan
BS|Bahamas
BH|Bahrain
BD|Bangladesh
BB|Barbados
BY|Belarus
BE|Belgium
BZ|Belize
BJ|Benin
BM|Bermuda
BT|Bhutan
BO|Bolivia
BQ|Bonaire, Sint Eustatius and Saba
BA|Bosnia and Herzegovina
BW|Botswana
BV|Bouvet Island
BR|Brazil
IO|British Indian Ocean Territory
BN|Brunei
BG|Bulgaria
BF|Burkina Faso
BI|Burundi
CV|Cabo Verde
KH|Cambodia
CM|Cameroon
CA|Canada
KY|Cayman Islands
CF|Central African Republic
TD|Chad
CL|Chile
CN|China
CX|Christmas Island
CC|Cocos (Keeling) Islands
CO|Colombia
KM|Comoros
CG|Congo
CD|Congo (Democratic Republic)
CK|Cook Islands
CR|Costa Rica
CI|Côte d'Ivoire
HR|Croatia
CU|Cuba
CW|Curaçao
CY|Cyprus
CZ|Czechia
DK|Denmark
DJ|Djibouti
DM|Dominica
DO|Dominican Republic
EC|Ecuador
EG|Egypt
SV|El Salvador
GQ|Equatorial Guinea
ER|Eritrea
EE|Estonia
SZ|Eswatini
ET|Ethiopia
FK|Falkland Islands
FO|Faroe Islands
FJ|Fiji
FI|Finland
FR|France
GF|French Guiana
PF|French Polynesia
TF|French Southern Territories
GA|Gabon
GM|Gambia
GE|Georgia
DE|Germany
GH|Ghana
GI|Gibraltar
GR|Greece
GL|Greenland
GD|Grenada
GP|Guadeloupe
GU|Guam
GT|Guatemala
GG|Guernsey
GN|Guinea
GW|Guinea-Bissau
GY|Guyana
HT|Haiti
HM|Heard Island and McDonald Islands
VA|Holy See
HN|Honduras
HK|Hong Kong
HU|Hungary
IS|Iceland
IN|India
ID|Indonesia
IR|Iran
IQ|Iraq
IE|Ireland
IM|Isle of Man
IL|Israel
IT|Italy
JM|Jamaica
JP|Japan
JE|Jersey
JO|Jordan
KZ|Kazakhstan
KE|Kenya
KI|Kiribati
KP|North Korea
KR|South Korea
KW|Kuwait
KG|Kyrgyzstan
LA|Laos
LV|Latvia
LB|Lebanon
LS|Lesotho
LR|Liberia
LY|Libya
LI|Liechtenstein
LT|Lithuania
LU|Luxembourg
MO|Macao
MG|Madagascar
MW|Malawi
MY|Malaysia
MV|Maldives
ML|Mali
MT|Malta
MH|Marshall Islands
MQ|Martinique
MR|Mauritania
MU|Mauritius
YT|Mayotte
MX|Mexico
FM|Micronesia
MD|Moldova
MC|Monaco
MN|Mongolia
ME|Montenegro
MS|Montserrat
MA|Morocco
MZ|Mozambique
MM|Myanmar
NA|Namibia
NR|Nauru
NP|Nepal
NL|Netherlands
NC|New Caledonia
NZ|New Zealand
NI|Nicaragua
NE|Niger
NG|Nigeria
NU|Niue
NF|Norfolk Island
MK|North Macedonia
MP|Northern Mariana Islands
NO|Norway
OM|Oman
PK|Pakistan
PW|Palau
PS|Palestine
PA|Panama
PG|Papua New Guinea
PY|Paraguay
PE|Peru
PH|Philippines
PN|Pitcairn
PL|Poland
PT|Portugal
PR|Puerto Rico
QA|Qatar
RE|Réunion
RO|Romania
RU|Russian Federation
RW|Rwanda
BL|Saint Barthélemy
SH|Saint Helena, Ascension and Tristan da Cunha
KN|Saint Kitts and Nevis
LC|Saint Lucia
MF|Saint Martin
PM|Saint Pierre and Miquelon
VC|Saint Vincent and the Grenadines
WS|Samoa
SM|San Marino
ST|Sao Tome and Principe
SA|Saudi Arabia
SN|Senegal
RS|Serbia
SC|Seychelles
SL|Sierra Leone
SG|Singapore
SX|Sint Maarten
SK|Slovakia
SI|Slovenia
SB|Solomon Islands
SO|Somalia
ZA|South Africa
GS|South Georgia and the South Sandwich Islands
SS|South Sudan
ES|Spain
LK|Sri Lanka
SD|Sudan
SR|Suriname
SJ|Svalbard and Jan Mayen
SE|Sweden
CH|Switzerland
SY|Syria
TW|Taiwan
TJ|Tajikistan
TZ|Tanzania
TH|Thailand
TL|Timor-Leste
TG|Togo
TK|Tokelau
TO|Tonga
TT|Trinidad and Tobago
TN|Tunisia
TR|Türkiye
TM|Turkmenistan
TC|Turks and Caicos Islands
TV|Tuvalu
UG|Uganda
UA|Ukraine
AE|United Arab Emirates
GB|United Kingdom
US|United States
UM|United States Minor Outlying Islands
UY|Uruguay
UZ|Uzbekistan
VU|Vanuatu
VE|Venezuela
VN|Viet Nam
VG|Virgin Islands (British)
VI|Virgin Islands (U.S.)
WF|Wallis and Futuna
EH|Western Sahara
YE|Yemen
ZM|Zambia
ZW|Zimbabwe
XK|Kosovo
`.trim();

const ALIASES: Record<string, string[]> = {
  US: ['USA', 'America', 'United States of America'],
  GB: ['UK', 'Britain', 'Great Britain', 'England', 'United Kingdom'],
  NL: ['Holland'],
  KR: ['Korea', 'Republic of Korea'],
  KP: ['DPRK'],
  RU: ['Russia'],
  CZ: ['Czech Republic'],
  CI: ['Ivory Coast'],
  AE: ['UAE', 'Emirates'],
  CD: ['DRC', 'Congo-Kinshasa'],
  CG: ['Congo-Brazzaville'],
  VN: ['Vietnam'],
  BO: ['Bolivia'],
  IR: ['Persia'],
  LA: ['Lao'],
  MD: ['Moldova'],
  TZ: ['Tanzania'],
  VE: ['Venezuela'],
  FM: ['Micronesia'],
  TW: ['ROC', 'Chinese Taipei'],
  TR: ['Turkey'],
  SZ: ['Swaziland'],
  MK: ['Macedonia'],
  MM: ['Burma'],
  TL: ['East Timor'],
  VA: ['Vatican', 'Vatican City'],
  DE: ['Deutschland'],
  CH: ['Swiss'],
  ZA: ['RSA'],
  XK: ['Kosova'],
};

export const COUNTRIES: Country[] = RAW.split('\n').map((line) => {
  const [code, name] = line.split('|');
  return { code, name };
});

const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

export function getCountry(code?: string): Country | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code.trim().toUpperCase());
}

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function searchCountries(query: string): Country[] {
  const q = fold(query);
  if (!q) return COUNTRIES;

  const compact = q.replace(/\s/g, '');
  const ranked = COUNTRIES.flatMap((country) => {
    const name = fold(country.name);
    const aliases = ALIASES[country.code] ?? [];
    let score = 0;

    const foldedAliases = aliases.map(fold);
    if (country.code.toLowerCase() === compact) score = 100;
    else if (foldedAliases.some((alias) => alias === q || alias === compact)) score = 95;
    else if (country.code.toLowerCase().startsWith(compact)) score = 80;
    else if (name.startsWith(q)) score = 70;
    else if (q.length >= 3 && name.includes(q)) score = 40;
    else if (q.length >= 3 && foldedAliases.some((alias) => alias.includes(q))) score = 30;
    else return [];

    return [{ country, score, name }];
  });

  ranked.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return ranked.map((entry) => entry.country);
}
