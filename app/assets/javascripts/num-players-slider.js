document.addEventListener("turbolinks:load", function() {
    const element = document.getElementById("num-player-slider");
    if (!element) return;

    noUiSlider.create(element, {
        start: [1, 12],
        connect: true,
        orientation: 'horizontal',
        range: {
            'min': 1,
            'max': 12
        },
        step: 1,
        pips: {
            mode: 'steps'
        }
    });
})