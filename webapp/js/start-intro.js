/**
 * For change this options, consult the IntroJs docs: https://introjs.com/docs/intro/options/
 */
function startIntro(){
  let intro = introJs();
  let checked=(EasyCookie.read("startIntro") === null)?('checked'):('');
  let btnOption={
    skipLabel: 'Sair',
    doneLabel: 'Fechar',
    nextLabel: 'Próximo',
    prevLabel: 'Anterior'
  };
  
  let stepOptions={
    tooltipPosition: 'right',
    steps: [
      {
        element: '#step1',
        intro: Translation[Lang.language].intro1
      },
      {
        element: '#step2',
        intro: Translation[Lang.language].intro2
      },
      {
        element: '#step3',
        intro: Translation[Lang.language].intro3
      },
      {
        intro: '<div class="introCookie"><input onclick="introConfig(this);" type="checkbox" '+checked+'><span id="option-intro"> '+Translation[Lang.language].intro4+'</span></div>'
      }
    ]
  };

  intro.setOptions((Lang.language=='pt-br')?(Object.assign(stepOptions, btnOption)):(stepOptions));
  intro.start();
};