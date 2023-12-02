import * as jsondiffpatch from 'jsondiffpatch';
import * as annotatedFormatter from 'jsondiffpatch/formatters/annotated';
import * as htmlFormatter from 'jsondiffpatch/formatters/html';

import 'jsondiffpatch/formatters/styles/html.css';
import 'jsondiffpatch/formatters/styles/annotated.css';

declare namespace CodeMirror {
  function fromTextArea(
    host: HTMLTextAreaElement,
    options?: EditorConfiguration,
  ): Editor;

  interface EditorConfiguration {
    mode?: string;
    json?: boolean;
    readOnly?: boolean;
  }

  interface Editor {
    getValue(): string;
    setValue(content: string): void;
    on(eventName: 'change', handler: () => void): void;
  }
}

interface Continent {
  name: string;
  summary: string;
  surface?: number;
  timezone: [number, number];
  demographics: { population: number; largestCities: string[] };
  languages: string[];
  countries: Country[];
  spanishName?: string;
}

interface Country {
  name: string;
  capital?: string;
  independence?: Date;
  unasur: boolean;
  population?: number;
}

const getExampleJson = function () {
  const data: Continent = {
    name: 'South America',
    summary:
      'South America (Spanish: América del Sur, Sudamérica or  \n' +
      'Suramérica; Portuguese: América do Sul; Quechua and Aymara:  \n' +
      'Urin Awya Yala; Guarani: Ñembyamérika; Dutch: Zuid-Amerika;  \n' +
      'French: Amérique du Sud) is a continent situated in the  \n' +
      'Western Hemisphere, mostly in the Southern Hemisphere, with  \n' +
      'a relatively small portion in the Northern Hemisphere.  \n' +
      'The continent is also considered a subcontinent of the  \n' +
      'Americas.[2][3] It is bordered on the west by the Pacific  \n' +
      'Ocean and on the north and east by the Atlantic Ocean;  \n' +
      'North America and the Caribbean Sea lie to the northwest.  \n' +
      'It includes twelve countries: Argentina, Bolivia, Brazil,  \n' +
      'Chile, Colombia, Ecuador, Guyana, Paraguay, Peru, Suriname,  \n' +
      'Uruguay, and Venezuela. The South American nations that  \n' +
      'border the Caribbean Sea—including Colombia, Venezuela,  \n' +
      'Guyana, Suriname, as well as French Guiana, which is an  \n' +
      'overseas region of France—are also known as Caribbean South  \n' +
      'America. South America has an area of 17,840,000 square  \n' +
      'kilometers (6,890,000 sq mi). Its population as of 2005  \n' +
      'has been estimated at more than 371,090,000. South America  \n' +
      'ranks fourth in area (after Asia, Africa, and North America)  \n' +
      'and fifth in population (after Asia, Africa, Europe, and  \n' +
      'North America). The word America was coined in 1507 by  \n' +
      'cartographers Martin Waldseemüller and Matthias Ringmann,  \n' +
      'after Amerigo Vespucci, who was the first European to  \n' +
      'suggest that the lands newly discovered by Europeans were  \n' +
      'not India, but a New World unknown to Europeans.',

    surface: 17840000,
    timezone: [-4, -2],
    demographics: {
      population: 385742554,
      largestCities: [
        'São Paulo',
        'Buenos Aires',
        'Rio de Janeiro',
        'Lima',
        'Bogotá',
      ],
    },
    languages: [
      'spanish',
      'portuguese',
      'english',
      'dutch',
      'french',
      'quechua',
      'guaraní',
      'aimara',
      'mapudungun',
    ],
    countries: [
      {
        name: 'Argentina',
        capital: 'Buenos Aires',
        independence: new Date(1816, 6, 9),
        unasur: true,
      },
      {
        name: 'Bolivia',
        capital: 'La Paz',
        independence: new Date(1825, 7, 6),
        unasur: true,
      },
      {
        name: 'Brazil',
        capital: 'Brasilia',
        independence: new Date(1822, 8, 7),
        unasur: true,
      },
      {
        name: 'Chile',
        capital: 'Santiago',
        independence: new Date(1818, 1, 12),
        unasur: true,
      },
      {
        name: 'Colombia',
        capital: 'Bogotá',
        independence: new Date(1810, 6, 20),
        unasur: true,
      },
      {
        name: 'Ecuador',
        capital: 'Quito',
        independence: new Date(1809, 7, 10),
        unasur: true,
      },
      {
        name: 'Guyana',
        capital: 'Georgetown',
        independence: new Date(1966, 4, 26),
        unasur: true,
      },
      {
        name: 'Paraguay',
        capital: 'Asunción',
        independence: new Date(1811, 4, 14),
        unasur: true,
      },
      {
        name: 'Peru',
        capital: 'Lima',
        independence: new Date(1821, 6, 28),
        unasur: true,
      },
      {
        name: 'Suriname',
        capital: 'Paramaribo',
        independence: new Date(1975, 10, 25),
        unasur: true,
      },
      {
        name: 'Uruguay',
        capital: 'Montevideo',
        independence: new Date(1825, 7, 25),
        unasur: true,
      },
      {
        name: 'Venezuela',
        capital: 'Caracas',
        independence: new Date(1811, 6, 5),
        unasur: true,
      },
    ],
  };

  const json = [JSON.stringify(data, null, 2)];

  data.summary = data.summary
    .replace('Brazil', 'Brasil')
    .replace('also known as', 'a.k.a.');
  data.languages[2] = 'inglés';
  data.countries.pop();
  data.countries.pop();
  data.countries[0].capital = 'Rawson';
  data.countries.push({
    name: 'Antártida',
    unasur: false,
  });

  // modify and move
  data.countries[4].population = 42888594;
  data.countries.splice(11, 0, data.countries.splice(4, 1)[0]);

  data.countries.splice(2, 0, data.countries.splice(7, 1)[0]);

  delete data.surface;
  data.spanishName = 'Sudamérica';
  data.demographics.population += 2342;

  json.push(JSON.stringify(data, null, 2));

  return json;
};

const instance = jsondiffpatch.create({
  objectHash: function (
    obj: { _id?: string; id?: string; name?: string },
    index,
  ) {
    if (typeof obj._id !== 'undefined') {
      return obj._id;
    }
    if (typeof obj.id !== 'undefined') {
      return obj.id;
    }
    if (typeof obj.name !== 'undefined') {
      return obj.name;
    }
    return '$$index:' + index;
  },
});

const dom = {
  addClass: function (el: HTMLElement, className: string) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  },
  removeClass: function (el: HTMLElement, className: string) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(
        new RegExp(
          '(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
          'gi',
        ),
        ' ',
      );
    }
  },
  text: function (el: HTMLElement, text: string) {
    if (typeof el.textContent !== 'undefined') {
      if (typeof text === 'undefined') {
        return el.textContent;
      }
      el.textContent = text;
    } else {
      if (typeof text === 'undefined') {
        return el.innerText;
      }
      el.innerText = text;
    }
  },
  getJson: function (
    url: string,
    callback: (error: Error | string | null, data?: unknown) => void,
  ) {
    let request: XMLHttpRequest | null = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        let data;
        try {
          data = JSON.parse(this.responseText, jsondiffpatch.dateReviver);
        } catch (parseError) {
          return callback('parse error: ' + parseError);
        }
        if (this.status >= 200 && this.status < 400) {
          callback(null, data);
        } else {
          callback(new Error('request failed'), data);
        }
      }
    };
    request.send();
    request = null;
  },
  runScriptTags: function (el: HTMLElement) {
    const scripts = el.querySelectorAll('script');
    for (let i = 0; i < scripts.length; i++) {
      const s = scripts[i];
      // eslint-disable-next-line no-eval
      eval(s.innerHTML);
    }
  },
};

const trim = function (str: string) {
  return str.replace(/^\s+|\s+$/g, '');
};

class JsonArea {
  element: HTMLTextAreaElement;
  container: HTMLElement;
  editor?: CodeMirror.Editor;

  constructor(element: HTMLTextAreaElement) {
    this.element = element;
    this.container = element.parentNode as HTMLElement;
    const self = this;
    const prettifyButton = this.container.querySelector(
      '.prettyfy',
    ) as HTMLElement;
    if (prettifyButton) {
      prettifyButton.addEventListener('click', function () {
        self.prettyfy();
      });
    }
  }

  error = (err: unknown) => {
    const errorElement = this.container.querySelector('.error-message')!;
    if (!err) {
      dom.removeClass(this.container, 'json-error');
      errorElement.innerHTML = '';
      return;
    }
    errorElement.innerHTML = err + '';
    dom.addClass(this.container, 'json-error');
  };

  getValue = () => {
    if (!this.editor) {
      return this.element.value;
    }
    return this.editor.getValue();
  };

  parse = () => {
    const txt = trim(this.getValue());
    try {
      this.error(false);
      if (
        /^\d+(.\d+)?(e[+-]?\d+)?$/i.test(txt) ||
        /^(true|false)$/.test(txt) ||
        /^["].*["]$/.test(txt) ||
        /^[{[](.|\n)*[}\]]$/.test(txt)
      ) {
        return JSON.parse(txt, jsondiffpatch.dateReviver);
      }
      return this.getValue();
    } catch (err) {
      this.error(err);
      throw err;
    }
  };

  setValue = (value: string) => {
    if (!this.editor) {
      this.element.value = value;
      return;
    }
    this.editor.setValue(value);
  };

  prettyfy = () => {
    const value = this.parse();
    const prettyJson =
      typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    this.setValue(prettyJson);
  };

  /* global CodeMirror */
  makeEditor = (readOnly?: boolean) => {
    if (typeof CodeMirror === 'undefined') {
      return;
    }
    this.editor = CodeMirror.fromTextArea(this.element, {
      mode: 'javascript',
      json: true,
      readOnly,
    });
    if (!readOnly) {
      this.editor.on('change', compare);
    }
  };
}

const areas = {
  left: new JsonArea(
    document.getElementById('json-input-left') as HTMLTextAreaElement,
  ),
  right: new JsonArea(
    document.getElementById('json-input-right') as HTMLTextAreaElement,
  ),
  delta: new JsonArea(
    document.getElementById('json-delta') as HTMLTextAreaElement,
  ),
};

const compare = function () {
  let left, right, error;
  document.getElementById('results')!.style.display = 'none';
  try {
    left = areas.left.parse();
  } catch (err) {
    error = err;
  }
  try {
    right = areas.right.parse();
  } catch (err) {
    error = err;
  }
  areas.delta.error(false);
  if (error) {
    areas.delta.setValue('');
    return;
  }
  const selectedType = getSelectedDeltaType();
  const visualdiff = document.getElementById('visualdiff')!;
  const annotateddiff = document.getElementById('annotateddiff')!;
  const jsondifflength = document.getElementById('jsondifflength')!;
  try {
    const delta = instance.diff(left, right);

    if (typeof delta === 'undefined') {
      switch (selectedType) {
        case 'visual':
          visualdiff.innerHTML = 'no diff';
          break;
        case 'annotated':
          annotateddiff.innerHTML = 'no diff';
          break;
        case 'json':
          areas.delta.setValue('no diff');
          jsondifflength.innerHTML = '0';
          break;
      }
    } else {
      switch (selectedType) {
        case 'visual':
          visualdiff.innerHTML = htmlFormatter.format(delta, left)!;
          if (
            !(document.getElementById('showunchanged') as HTMLInputElement)
              .checked
          ) {
            htmlFormatter.hideUnchanged();
          }
          dom.runScriptTags(visualdiff);
          break;
        case 'annotated':
          annotateddiff.innerHTML = annotatedFormatter.format(delta)!;
          break;
        case 'json':
          areas.delta.setValue(JSON.stringify(delta, null, 2));
          jsondifflength.innerHTML =
            Math.round(JSON.stringify(delta).length / 102.4) / 10.0 + '';
          break;
      }
    }
  } catch (err) {
    jsondifflength.innerHTML = '0';
    visualdiff.innerHTML = '';
    annotateddiff.innerHTML = '';
    areas.delta.setValue('');
    areas.delta.error(err);
    if (typeof console !== 'undefined' && console.error) {
      console.error(err);
      console.error((err as Error).stack);
    }
  }
  document.getElementById('results')!.style.display = '';
};

areas.left.makeEditor();
areas.right.makeEditor();

areas.left.element.addEventListener('change', compare);
areas.right.element.addEventListener('change', compare);
areas.left.element.addEventListener('keyup', compare);
areas.right.element.addEventListener('keyup', compare);

const getSelectedDeltaType = function () {
  if (
    (document.getElementById('show-delta-type-visual') as HTMLInputElement)
      .checked
  ) {
    return 'visual';
  }
  if (
    (document.getElementById('show-delta-type-annotated') as HTMLInputElement)
      .checked
  ) {
    return 'annotated';
  }
  if (
    (document.getElementById('show-delta-type-json') as HTMLInputElement)
      .checked
  ) {
    return 'json';
  }
};

const showSelectedDeltaType = function () {
  const type = getSelectedDeltaType();
  document.getElementById('delta-panel-visual')!.style.display =
    type === 'visual' ? '' : 'none';
  document.getElementById('delta-panel-annotated')!.style.display =
    type === 'annotated' ? '' : 'none';
  document.getElementById('delta-panel-json')!.style.display =
    type === 'json' ? '' : 'none';
  compare();
};

document
  .getElementById('show-delta-type-visual')!
  .addEventListener('click', showSelectedDeltaType);
document
  .getElementById('show-delta-type-annotated')!
  .addEventListener('click', showSelectedDeltaType);
document
  .getElementById('show-delta-type-json')!
  .addEventListener('click', showSelectedDeltaType);

document.getElementById('swap')!.addEventListener('click', function () {
  const leftValue = areas.left.getValue();
  areas.left.setValue(areas.right.getValue());
  areas.right.setValue(leftValue);
  compare();
});

document.getElementById('clear')!.addEventListener('click', function () {
  areas.left.setValue('');
  areas.right.setValue('');
  compare();
});

document
  .getElementById('showunchanged')!
  .addEventListener('change', function () {
    htmlFormatter.showUnchanged(
      (document.getElementById('showunchanged') as HTMLInputElement).checked,
      null,
      800,
    );
  });

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(compare);
});

interface DataObject {
  name?: string;
  content?: string;
  fullname?: string;
}

interface Data {
  url?: string;
  description?: string;
  left?: DataObject | string;
  right?: DataObject | string;
  error?: unknown;
}

interface Load {
  data: (dataArg?: Data) => void;
  gist: (this: Load, id: string) => void;
  leftright: (
    this: Load,
    descriptionArg: string | undefined,
    leftValueArg: string,
    rightValueArg: string,
  ) => void;
  key: (key: string) => void;
}

const load: Load = {
  data: function (dataArg) {
    const data = dataArg || {};
    dom.text(document.getElementById('description')!, data.description || '');
    if (data.url && trim(data.url).substring(0, 10) !== 'javascript') {
      document.getElementById('external-link')!.setAttribute('href', data.url);
      document.getElementById('external-link')!.style.display = '';
    } else {
      document.getElementById('external-link')!.style.display = 'none';
    }
    const leftValue = data.left
      ? (data.left as DataObject).content || (data.left as string)
      : '';
    areas.left.setValue(leftValue);
    const rightValue = data.right
      ? (data.right as DataObject).content || (data.right as string)
      : '';
    areas.right.setValue(rightValue);

    dom.text(
      document.getElementById('json-panel-left')!.querySelector('h2')!,
      (data.left && (data.left as DataObject).name) || 'left.json',
    );
    dom.text(
      document.getElementById('json-panel-right')!.querySelector('h2')!,
      (data.right && (data.right as DataObject).name) || 'right.json',
    );

    document
      .getElementById('json-panel-left')!
      .querySelector('h2')!
      .setAttribute(
        'title',
        (data.left && (data.left as DataObject).fullname) || '',
      );
    document
      .getElementById('json-panel-right')!
      .querySelector('h2')!
      .setAttribute(
        'title',
        (data.right && (data.right as DataObject).fullname) || '',
      );

    if (data.error) {
      areas.left.setValue('ERROR LOADING: ' + data.error);
      areas.right.setValue('');
    }
  },

  gist: function (id) {
    dom.getJson('https://api.github.com/gists/' + id, function (error, data) {
      interface GistError {
        message?: string;
      }

      if (error) {
        const gistError = data as GistError;
        const message =
          error + (gistError && gistError.message ? gistError.message : '');
        load.data({
          error: message,
        });
        return;
      }

      interface GistData {
        files: Record<
          string,
          { language: string; filename: string; content: string }
        >;
        html_url: string;
        description: string;
      }

      const gistData = data as GistData;

      const filenames = [];
      for (const filename in gistData.files) {
        const file = gistData.files[filename];
        if (file.language === 'JSON') {
          filenames.push(filename);
        }
      }
      filenames.sort();
      const files = [
        gistData.files[filenames[0]],
        gistData.files[filenames[1]],
      ];
      /* jshint camelcase: false */
      load.data({
        url: gistData.html_url,
        description: gistData.description,
        left: {
          name: files[0].filename,
          content: files[0].content,
        },
        right: {
          name: files[1].filename,
          content: files[1].content,
        },
      });
    });
  },

  leftright: function (descriptionArg, leftValueArg, rightValueArg) {
    try {
      const description = decodeURIComponent(descriptionArg || '');
      const leftValue = decodeURIComponent(leftValueArg);
      const rightValue = decodeURIComponent(rightValueArg);
      const urlmatch = /https?:\/\/.*\/([^/]+\.json)(?:[?#].*)?/;
      const dataLoaded: {
        description: string;
        left: DataObject;
        right: DataObject;
      } = {
        description,
        left: {},
        right: {},
      };
      const loadIfReady = function () {
        if (
          typeof dataLoaded.left.content !== 'undefined' &&
          typeof dataLoaded.right.content !== 'undefined'
        ) {
          load.data(dataLoaded);
        }
      };
      if (urlmatch.test(leftValue)) {
        dataLoaded.left.name = urlmatch.exec(leftValue)![1];
        dataLoaded.left.fullname = leftValue;
        dom.getJson(leftValue, function (error, data) {
          if (error) {
            dataLoaded.left.content =
              error +
              (data && (data as { message?: string }).message
                ? (data as { message: string }).message
                : '');
          } else {
            dataLoaded.left.content = JSON.stringify(data, null, 2);
          }
          loadIfReady();
        });
      } else {
        dataLoaded.left.content = leftValue;
      }
      if (urlmatch.test(rightValue)) {
        dataLoaded.right.name = urlmatch.exec(rightValue)![1];
        dataLoaded.right.fullname = rightValue;
        dom.getJson(rightValue, function (error, data) {
          if (error) {
            dataLoaded.right.content =
              error +
              (data && (data as { message?: string }).message
                ? (data as { message: string }).message
                : '');
          } else {
            dataLoaded.right.content = JSON.stringify(data, null, 2);
          }
          loadIfReady();
        });
      } else {
        dataLoaded.right.content = rightValue;
      }
      loadIfReady();
    } catch (err) {
      load.data({
        error: err,
      });
    }
  },

  key: function (key: string) {
    const matchers = {
      gist: /^(?:https?:\/\/)?(?:gist\.github\.com\/)?(?:[\w0-9\-a-f]+\/)?([0-9a-f]+)$/i,
      leftright: /^(?:desc=(.*)?&)?left=(.*)&right=(.*)&?$/i,
    };
    for (const loader in matchers) {
      const match = matchers[loader as keyof typeof matchers].exec(key);
      if (match) {
        return (
          load[loader as keyof typeof matchers] as (
            this: Load,
            ...args: string[]
          ) => void
        ).apply(load, match.slice(1));
      }
    }
    load.data({
      error: 'unsupported source: ' + key,
    });
  },
};

const urlQuery = /^[^?]*\?([^#]+)/.exec(document.location.href);
if (urlQuery) {
  load.key(urlQuery[1]);
} else {
  const exampleJson = getExampleJson();
  load.data({
    left: exampleJson[0],
    right: exampleJson[1],
  });
}

(document.getElementById('examples') as HTMLSelectElement).addEventListener(
  'change',
  function () {
    const example = trim(this.value);
    switch (example) {
      case 'text': {
        const exampleJson = getExampleJson();
        load.data({
          left: {
            name: 'left.txt',
            content: JSON.parse(exampleJson[0]).summary,
          },
          right: {
            name: 'right.txt',
            content: JSON.parse(exampleJson[1]).summary,
          },
        });
        break;
      }
      case 'gist':
        document.location = '?benjamine/9188826';
        break;
      case 'moving':
        document.location =
          '?desc=moving%20around&left=' +
          encodeURIComponent(
            JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
          ) +
          '&right=' +
          encodeURIComponent(
            JSON.stringify([10, 0, 1, 7, 2, 4, 5, 6, 88, 9, 3]),
          );
        break;
      case 'query':
        document.location =
          '?desc=encoded%20in%20url&left=' +
          /* jshint quotmark: false */
          encodeURIComponent(
            JSON.stringify({
              "don't": 'abuse',
              with: ['large', 'urls'],
            }),
          ) +
          '&right=' +
          encodeURIComponent(
            JSON.stringify({
              "don't": 'use',
              with: ['>', 2, 'KB urls'],
            }),
          );
        break;
      case 'urls':
        document.location =
          '?desc=http%20raw%20file%20urls&left=' +
          encodeURIComponent(
            'https://rawgithub.com/benjamine/JsonDiffPatch/' +
              'c83e942971c627f61ef874df3cfdd50a95f1c5a2/package.json',
          ) +
          '&right=' +
          encodeURIComponent(
            'https://rawgithub.com/benjamine/JsonDiffPatch/master/package.json',
          );
        break;
      default:
        document.location = '?';
        break;
    }
  },
);
