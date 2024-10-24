function gotSources(deviceList) {
    audioSources = deviceList;
    sourceSelect.option('Select Source', -1); // Default option

    // Populate dropdown menu with available audio sources
    for (let i = 0; i < audioSources.length; i++) {
        sourceSelect.option(audioSources[i].label, i);
    }
}

function changeSource() {
    let selectedIndex = sourceSelect.value();
    if (selectedIndex >= 0) {
        mic.setSource(selectedIndex);
        console.log('Changed source to: ' + audioSources[selectedIndex].label);
    }
}

function showSourceOptions(){

      mic.getSources(gotSources);

      // Create dropdown menu for selecting audio source
      sourceSelect = createSelect();
      sourceSelect.position(10, 10);
      sourceSelect.changed(changeSource);

      sourceButton = createButton('Hide Audio Sources');

      //If button is pressed hide dropdown menu
      sourceButton.mousePressed(hideDropDown);

}

function hideDropDown(){
    sourceSelect.hide();
    sourceButton.hide();
}