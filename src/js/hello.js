exportLocal({
    data: {
        a: 1,
        b: "world",
        toggle: false,

    },
    send: function () {

        if (!this.toggle) {
            this.toggle = true;

            this.interval = setInterval(() => {
                this.a++
            }, 100);
        } else {
            this.toggle = false;
            clearInterval(this.interval)
        }
    },
});

    // exportListeners({
    //     0: {
    //         id: "asd", type: "click", call: function (event, this) {
    //             console.log('ok');
    //         }
    //     }
    // });
