$("#notice").click(function () {
  EasyCookie.create("firstNotice", "Not show modal again", 30);
});
function introConfig(cbx) {
  if(!cbx.checked)
    EasyCookie.create("startIntro", "No start intro again", 30);
  else
    EasyCookie.remove("startIntro");
}
/**
* Show the main TerraBrasilis modal
*/
let cookieFirstNotice = EasyCookie.read("firstNotice");
if (cookieFirstNotice === null) {
  $('#firstNotice').modal('show');
}