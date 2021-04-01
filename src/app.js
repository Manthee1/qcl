


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

    styles: {}, // Leave empty
    scripts: {},

    parse: async function (componentName) {
        if (!isDefined(document.querySelector(componentName))) {
            return true
        }
        if (isDefined(this.list[componentName])) {
            let componentPath = this.list[componentName].src

            console.log("Parsing", componentPath);
            // Fetch the component
            let componentData = await fetch(this._ + componentPath)
            let componentText = await componentData.text()

            // For every same component tag apply the fetched data
            for (const x of document.querySelectorAll(componentName)) {

                // Generate a component id and create a object
                while (true) {
                    let generatedId = Math.round(Math.random() * 1000)
                    if (!exportData._.includes(generatedId)) {
                        exportData._.push(generatedId);
                        exportData[generatedId] = {
                            _id: generatedId, componentName: componentName, elements: [], data: {},
                            updateElements: function () {
                                this.elements.forEach(x => {
                                    console.log(x, this);
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
                await this.import()

                // Get the last added component id A.K.A. this components id
                lastId = exportData._.slice(-1);

                // Add a class name referencing the component object and parse the markup
                let i = 0;
                for (const element of x.querySelectorAll('*')) {
                    element.classList.add(componentName + '-' + lastId)
                    parsedMarkup = element.innerHTML.replaceAll('{{', '${').replaceAll("}}", "}")
                    element.innerHTML = exportData.run(lastId, '`' + parsedMarkup + '`')
                    const idAttribute = `${componentName}-${lastId}-${i++}`
                    const elementObj = {
                        getElement: function () { console.log(this._id); return document.querySelector(`[___id="${this._id}"]`) }, _id: idAttribute, markup: parsedMarkup
                    }
                    element.setAttribute('___id', idAttribute)
                    exportData[lastId].elements.push(elementObj);
                }
                //Overwrite the component initializer with the component.
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

        } else throw `There is no entry for ${componentName} in the component list`
    },

    //Run parser for each component
    run: async function () {
        for (const component of Object.keys(this.list)) {
            let componentName = component
            await this.parse(componentName)
        }
    },


    //Parse the import tags and import the specified things...
    import: async function () {
        return new Promise(async (resolve) => {
            for (const x of document.querySelectorAll('import')) {
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
                    case "component":
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
                    return this[id].data.run()

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