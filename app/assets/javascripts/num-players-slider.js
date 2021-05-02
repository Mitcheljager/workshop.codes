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
    },
    behaviour: 'tap-drag'
  });

  element.noUiSlider.on('set', onSliderUpdate);
});

function onSliderUpdate(values, handle) {
  let element;
  switch (handle) {
    case 0:
      element = document.getElementById("post_min_players");
      break;
    case 1:
      element = document.getElementById("post_max_players");
      break;
  }
  element.value = Math.round(values[handle]);
}