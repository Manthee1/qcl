const views = {
    startingView: "Test",
    _: "./src/views/", //root path to the views directory

    list: {
        GoodbyeWorldView: { src: "GoodbyeWorldView.html" },
        HelloWorldView: { src: "HelloWorldView.html" },
        Test: { src: "Test.html" },
        //Same as for components.
        //You can call router.setView(nameOfTheViewDefinedInThisList) and change the view.
    }
}

const components = {
    _: "./src/components/", //root path to the components directory

    list: {
        HelloWorld: { src: "HelloWorld.html" },
        GoodbyeWorld: { src: "GoodbyeWorld.html" },
        // HelloWorld - tag name that will be overwritten with the html of the source file
        // HelloWorld.html - is the html file that contains the component html

        // If a a component is not defined but it's html file is the "components" or what ever you put as the source dir. Then it will try and load it (given that  the tag name is lowercase)
        // h.html works that way! It's not listed here but if it exists in the view than it will be loaded.
    },

    styles: {}, // Leave empty
    scripts: {},
    eventListenerList: ["abort", "afterprint", "animationend", "animationiteration", "animationstart", "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change", "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended", "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "mousewheel", "offline", "online", "open", "pagehide", "pageshow", "paste", "pause", "play", "playing", "popstate", "progress", "ratechange", "resize", "reset", "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "storage", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "unload", "volumechange", "waiting", "wheel",],

    parse: async function (componentName) {
        const componentSelector = componentName + ":not([___parsing])";
        if (!isDefined(document.querySelector(componentSelector))) {
            return true
        }

        let componentPath = componentName + '.html'
        if (!isObjectEmpty(this.list[componentName]) && !isTextEmpty(this.list[componentName].src)) componentPath = this.list[componentName].src
        console.log("Parsing", componentPath);

        let componentData, componentText;
        // Fetch the component
        try {// Try catch so that nonexisting components don't throw errors.
            componentData = await fetch(this._ + componentPath)
            componentText = await componentData.text()
        } catch (e) {
            componentData = { ok: false }
        }

        if (componentData.ok == true) {
            // For every same component tag apply the fetched data
            for (const x of document.querySelectorAll(componentSelector)) {
                x.setAttribute('___parsing', true);
                // Generate a component id and create a object
                let generatedId = null;
                while (true) {
                    generatedId = Math.round(Math.random() * 1000)
                    if (!exportData._.includes(generatedId)) {
                        exportData._.push(generatedId);
                        exportData[generatedId] = {
                            _id: generatedId, componentName: componentName, elements: [], data: {},
                            updateElements: function () {
                                console.log(this._id, '`' + x.markup + '`');
                                this.elements.forEach(x => {
                                    console.log(x, x.getElement());
                                    x.getElement().innerHTML = exportData.run(this._id, '`' + x.markup + '`');
                                })
                            }
                        };
                        break;
                    }
                }

                // Add the fetched data to the tag
                x.innerHTML += componentText
                // Run all script tags and remove them
                document.querySelectorAll("script[local]").forEach(x => {
                    eval(x.innerHTML);
                    x.remove();
                })

                // Parse the import data
                await this.import('css')
                await this.import('js')

                //Mark elements that are components with the '___component' attribute
                for (const element of x.querySelectorAll("import[type='components']")) {
                    componentsArray = element.getAttribute('src').split(' ')
                    componentsArray.forEach(componentName => x.querySelectorAll(componentName).forEach(component => component.setAttribute('___component', true)))
                }

                let i = 0;
                // Add a class name referencing the component object and parse the markup
                for (const element of x.querySelectorAll("*:not(import):not([___component])")) {
                    element.classList.add(componentName + '-' + generatedId)
                    parsedMarkup = element.innerHTML.replaceAll('{{', '${').replaceAll("}}", "}")
                    element.innerHTML = exportData.run(generatedId, '`' + parsedMarkup + '`')
                    const idAttribute = `${componentName}-${generatedId}-${i++}`
                    const elementObj = {
                        getElement: function () { return document.querySelector(`[___id="${this._id}"]`) }, _id: idAttribute, markup: parsedMarkup
                    }
                    if (!element.hasAttribute("___id")) {
                        element.setAttribute('___id', idAttribute)
                        element.setAttribute('___component-id', generatedId)
                    }
                    exportData[generatedId].elements.push(elementObj);
                }

                //Overwrite the component initializer with the component.
                x.outerHTML = x.innerHTML;

                await this.import('components')
            }

            //Adds a event listener for every existing listener.
            this.eventListenerList.forEach(eventListener => {
                for (const x of document.querySelectorAll(`*[--${eventListener}]`)) {
                    let clickAction = x.getAttribute(`--${eventListener}`);
                    x.removeAttribute(`--${eventListener}`);
                    if (isDefined(clickAction)) {
                        let componentId = x.getAttribute('___component-id')
                        x.addEventListener(eventListener, e => {
                            exportData.run(componentId, clickAction);
                        })
                    }
                }
            });

        } else throw `There is no entry for ${componentName} in the component list`
    },

    //Run parser for each component
    run: async function () {
        let componentIndex = {};

        for (const component of Object.keys(this.list)) {
            const componentName = component
            componentIndex[componentName] = true // Value is useless here so it does not matter what it is assigned as..
        }

        for (const component of document.body.querySelectorAll("*")) {
            const componentName = component.localName
            componentIndex[componentName] = true // Value is useless here so it does not matter what it is assigned as..
        }

        for (const componentName of Object.keys(componentIndex)) {
            this.parse(componentName);
        }


    },


    //Parse the import tags and import the specified things...
    import: async function (typeToImport = "") {
        typeToImport = typeToImport || "";
        return new Promise(async (resolve) => {
            let elements = typeToImport == "" ? document.querySelectorAll(`import`) : document.querySelectorAll(`import[type='${typeToImport}']`)
            for (const x of elements) {
                let type = x.getAttribute('type').trim()
                let src = x.getAttribute('src').trim()
                switch (type) {
                    //Simple checks and add a link element to the <head>
                    case "css":
                        const force = isDefined(x.getAttribute('force'));
                        const fixed = isDefined(x.getAttribute('fixed'));
                        if (!isDefined(this.styles[src]) || force) {
                            const cssLink = document.querySelector('html').querySelector(`[href='${src}']`)
                            if (force && isDefined(cssLink)) {
                                cssLink.remove();
                            }
                            document.querySelector('head').insertAdjacentHTML('beforeend', `<link type="text/css" rel="stylesheet" href=${src}>`)
                            this.styles[src] = { fixed: fixed };
                        }
                        break;
                    //Parse the imported components
                    case "components":
                        let componentsList = src.split(" ");
                        for (let componentName of componentsList) {
                            console.log("Component Import ", componentName);
                            componentName = componentName.trim();
                            await this.parse(componentName);
                        }
                        break;
                    //Fetch javascript and execute it 
                    case "js":
                        if (!isDefined(this.scripts[src])) {
                            let jsText = await fetch(src);
                            jsText = await jsText.text();
                            this.scripts[src] = { text: await jsText };
                            await eval(await jsText);
                        } else
                            eval(this.scripts[src].text)
                        break;
                    default:
                        break;
                }
                x.remove()
            }
            resolve(true)
        });
    },
}

router = {

    setView: async function (name) {
        if (isDefined(views.list[name])) {

            //Fetch the view html
            let viewData = await fetch(views._ + views.list[name].src);
            document.querySelector("body").innerHTML = await viewData.text()

            //Create the export data object
            exportData = {
                _: [],
                run: function (id, code) {
                    this[id].data.run = function () { return eval(code) };
                    return this[id].data.run();
                },
            }
            //Remove all the unfixed styles from <head>
            Object.entries(components.styles).forEach(x => {
                if (!x[1].fixed) {
                    delete components.styles[x[0]]
                    const cssLink = document.querySelector('html').querySelector(`[href='${x[0]}']`)
                    if (isDefined(cssLink)) cssLink.remove()
                }
            })
            components.run();
            return true
        }
        throw `There is no entry for ${name} in the views list`
    },
}

//Parses a component js export object 
function exportLocal(obj) {
    //Verify that obj is an object and is not empty or return;
    if (!isDefined(obj) || !isObject(obj)) return;
    let lastId = exportData._.slice(-1)
    exportData[lastId].data = obj

    //Also verify that obj.data is an object and is not empty or return;
    if (!isDefined(obj.data) || !isObject(obj.data)) return;

    Object.keys(obj.data).forEach(x => {
        Object.defineProperty(exportData[lastId].data, x, {
            set: function (val) { this.data[x] = val; console.log('we settin ' + x + ' to:', val); exportData[lastId].updateElements() },
            get: function (val) { return this.data[x] },
        })

    })
}

let isDefined = el => {
    if (typeof el == "undefined" || el == null) return false;
    else return true;
}

let isObject = obj => isDefined(obj) && Object.prototype.toString.call(obj) == "[object Object]"
let isObjectEmpty = obj => {
    if (isDefined(obj))
        return Object.entries(obj).length == 0
    else return true
}

let isFunction = func => {
    if (isDefined(func) && typeof func == "function") return true
    return false
}
let isArrayEmpty = arr => {
    if (isDefined(arr) && typeof arr == "Object")
        return arr.length == 0
}

let isTextEmpty = x => {
    return (x.toString().trim().length == 0);
}


window.onload = async (event) => {
    router.setView(views.startingView)
}