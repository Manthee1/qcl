exportLocal({
    data: {
        a: 1,
        b: "<h5>NO</h5>",
        toggle: false,
    },
    send: function () {
        if (!this.toggle) {
            this.toggle = true;
            this.interval = setInterval(() => {
                this.a++
                this.b = `<h5>NO${this.a}</h5>`
            }, 100);
        } else {
            this.toggle = false;
            clearInterval(this.interval)
        }
    },
    onDeploy: function () {
        console.log("hello");
    }
});
