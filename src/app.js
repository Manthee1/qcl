


const views = {
    startingView: "GoodbyeWorldView",
    _: "./src/views/", //root path to the views directory

    list: {
        GoodbyeWorldView: { src: "GoodbyeWorldView.html" },
        HelloWorldView: { src: "HelloWorldView.html" },
        //Same as for components.
        //You can call router.setView(nameOfTheViewDefinedInThisList) and change the view.
    }
}

const components = {
    _: "./src/components/", //root path to the components directory

    list: {
        h: { src: "h.html" },
        HelloWorld: { src: "HelloWorld.html" },
        GoodbyeWorld: { src: "GoodbyeWorld.html" },
        // HelloWorld - tag name that will be overwritten with the html of the source file
        // HelloWorld.html - is the html file that contains the component html
    },

    styles: {}, //Leave empty
    scripts: {},

    parse: async function (componentName) {
        if (!isDefined(document.querySelector(componentName))) {
            return true
        }
        if (isDefined(this.list[componentName])) {
            let componentPath = this.list[componentName].src

            console.log("Parsing", componentPath);
            let componentData = await fetch(this._ + componentPath)
            let componentText = await componentData.text()

            for (const x of document.querySelectorAll(componentName)) {

                while (true) {
                    let generatedId = Math.round(Math.random() * 1000)
                    if (!exportData._.includes(generatedId)) {
                        exportData._.push(generatedId);
                        exportData[generatedId] = {
                            _id: generatedId, componentName: componentName, elements: [], data: {},
                            updateElements: function () {
                                this.elements.forEach(x => {
                                    console.log(x, this);
                                    x.element.innerHTML = exportData.run(this._id, '`' + x.markup + '`');
                                })
                            }
                        };
                        break;
                    }
                }

                x.innerHTML = componentText
                for (let i = 0; isDefined(document.body.querySelector("script[local]")) && i < 5; i++) {
                    document.querySelectorAll("script[local]").forEach(x => {
                        eval(x.innerHTML);
                        x.remove();
                    })
                }

                await this.import()

                lastId = exportData._.slice(-1);
                let parsedComponentText = "";
                for (const element of x.querySelectorAll('*')) {
                    element.classList.add(componentName + '-' + lastId)
                    parsedMarkup = element.innerHTML.replaceAll('{{', '${').replaceAll("}}", "}")
                    element.innerHTML = exportData.run(lastId, '`' + parsedMarkup + '`')
                    element.setAttribute('___markup', parsedMarkup)
                    // parsedComponentText += element.outerHTML
                    console.log(element);
                }

                // let parsedComponentText = x.innerHTML;
                // parsedComponentText = parsedComponentText.replaceAll('{{', '${').replaceAll("}}", "}");

                // x.outerHTML = exportData.run(lastId, '`' + parsedComponentText + '`');
                for (const element of document.querySelectorAll(`.${componentName}-${lastId}`)) {
                    console.log(element.getAttribute('___markup'));
                    markup = element.getAttribute('___markup')
                    element.removeAttribute('___markup')
                    exportData[lastId].elements.push({ element: element, markup: markup });
                }
                for (const x of document.querySelectorAll("*[--click]")) {
                    console.log('ca');
                    let clickAction = x.getAttribute('--click');
                    x.removeAttribute('--click');
                    if (isDefined(clickAction)) {
                        let lastId = exportData._.slice(-1);
                        x.addEventListener("click", e => {
                            console.log('click');
                            exportData.run(lastId, clickAction);
                        })
                    }
                }
            }

        } else throw `There is no entry for ${componentName} in the component list`
    },

    run: async function () {
        for (const component of Object.keys(this.list)) {
            let componentName = component
            await this.parse(componentName) // Await so that the components load before we parse the import tags
        }
    },



    import: async function (callback) {
        return new Promise(async (resolve) => {
            for (const x of document.querySelectorAll('import')) {
                let type = x.getAttribute('type').trim()
                let src = x.getAttribute('src').trim()
                switch (type) {



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
                    case "components":
                        let componentsList = src.split(" ");
                        for (let componentName of componentsList) {
                            console.log("Component Import ", componentName);
                            componentName = componentName.trim();
                            await this.parse(componentName);
                        }
                        break;
                    case "js":
                        // const jsLink = document.querySelector('html').querySelector(`[href='${src}']`)
                        if (!isDefined(this.scripts[src])) {
                            let jsText = await fetch(src);
                            jsText = await jsText.text();
                            this.scripts[src] = { text: await jsText };
                            await eval(await jsText);
                        } else
                            eval(this.scripts[src].text)
                        // document.querySelector('head').insertAdjacentHTML('beforeend', `<link type="text/css" rel="stylesheet" href=${src}>`)
                        break;
                    default:
                        break;
                }
                x.remove()
            }
            // await jsText
            resolve(true)
        });
    },
}

router = {

    setView: async function (name) {
        if (isDefined(views.list[name])) {

            let viewData = await fetch(views._ + views.list[name].src);
            document.querySelector("body").innerHTML = await viewData.text()

            exportData = {
                _: [],
                run: function (id, code) {

                    this[id].data.run = function () { return eval(code) };
                    return this[id].data.run()

                },
            }

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

function exportLocal(obj) {
    let lastId = exportData._.slice(-1)
    exportData[lastId].data = obj
    Object.keys(obj.data).forEach(x => {
        Object.defineProperty(exportData[lastId].data, x, {
            set: function (val) { this.data[x] = val; console.log('we settin to:', val); exportData[lastId].updateElements() },
            get: function (val) { return this.data[x] },
        })

    })
}

let isDefined = el => {
    if (typeof el == "undefined" || el == null) return false;
    else return true;
}

window.onload = async (event) => {
    router.setView(views.startingView)
}

obj = { a: 1 }
window.watch