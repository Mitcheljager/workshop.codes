document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll(".num-player-slider");
  elements.forEach(function (element) {
    if (!element) return;
    let startMin = 1;
    let startMax = 12;
    if (element.dataset.type == 'post') {
      startMin = element.dataset.minPlayers;
      startMax = element.dataset.maxPlayers;
    }

    noUiSlider.create(element, {
      start: [startMin, startMax],
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

    switch (element.dataset.type) {
      case 'post':
        element.noUiSlider.on('set', postOnSliderUpdate);
        break;
      case 'filter':
        element.noUiSlider.on('set', filterOnSliderUpdate);
        break;
    }
  });
});

function postOnSliderUpdate(values, handle) {
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

function filterOnSliderUpdate(values) {
  // TODO: Update search filters and stuff
}
