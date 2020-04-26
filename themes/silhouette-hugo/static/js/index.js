const page = document;

function isObj(obj) {
  return (obj && typeof obj === 'object' && obj !== null) ? true : false;
}

function elem(selector, parent = document){
  let elem = document.querySelector(selector);
  return elem != false ? elem : false;
}

function elems(selector) {
  let elems = document.querySelectorAll(selector);
  return elems.length ? elems : false; 
}

function pushClass(el, targetClass) {
  // equivalent to addClass
  if (el && typeof el == 'object' && targetClass) {
    elClass = el.classList;
    elClass.contains(targetClass) ? false : elClass.add(targetClass);
  }
}

function deleteClass(el, targetClass) {
  // equivalent to removeClass
  if (el && typeof el == 'object' && targetClass) {
    elClass = el.classList;
    elClass.contains(targetClass) ? elClass.remove(targetClass) : false;
  }
}

function modifyClass(el, targetClass) {
  // equivalent to toggleClass
  if (el && typeof el == 'object' && targetClass) {
    elClass = el.classList;
    elClass.contains(targetClass) ? elClass.remove(targetClass) : elClass.add(targetClass);
  }
}

function containsClass(el, targetClass) {
  if (el && typeof el == 'object' && targetClass) {
    return el.classList.contains(targetClass) ? true : false;
  }
}

function createEl(element = 'div') {
  return document.createElement(element);
}

function wrapEl(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}

function isChild(node, parentClass) {
  let objectsAreValid = isObj(node) && parentClass && typeof parentClass == 'string';
  return (objectsAreValid && node.closest(parentClass)) ? true : false;
}

function elemAttribute(elem, attr, value = null) {
  if (value) {
    elem.setAttribute(attr, value);
  } else {
    value = elem.getAttribute(attr);
    return value ? value : false;
  }
}

function populateAlt(images) {
  images.forEach((image) => {
    const inline = ":inline";
    let alt = image.alt;
    const isInline = alt.includes(inline);
    alt = alt.replace(inline, "");
    if (alt.length > 0 && !containsClass(image, 'alt')) {
      let desc = document.createElement('p');
      desc.classList.add('thumb-alt');
      desc.textContent = image.alt;
      image.insertAdjacentHTML('afterend', desc.outerHTML);
    }

    if(isInline) {
      modifyClass(image, 'inline');
    }
  });
  
  hljs.initHighlightingOnLoad();
}

function largeImages(baseParent, images = []) {
  images.forEach(function(image) {
    let actualWidth = image.naturalWidth;
    
    let parentWidth = baseParent.offsetWidth;
    
    let actionableRatio = actualWidth / parentWidth;
    
    if (!(actionableRatio <= 1)) {
      pushClass(image, "image-scalable");
      image.dataset.scale = actionableRatio;
      
      let figure = createEl('figure');
      
      wrapEl(image, figure)
    }
    
  })
}

(function AltImage() {
  let post = elem('.post');
  let images = post ? post.querySelectorAll('img') : false;
  images ? populateAlt(images) : false;
  largeImages(post, images);
})();

function fileClosure() {
  
  page.addEventListener('click', function(event) {
    let target = event.target;
    isClickableImage = target.matches('.image-scalable');

    let isFigure = target.matches('figure');

    if(isFigure) {
      let hasClickableImage = containsClass(target.children[0], 'image-scalable');
      if(hasClickableImage) {
        modifyClass(target, 'image-scale');
      }
    }
    
    if(isClickableImage) {
      let figure = target.parentNode;
      modifyClass(figure, 'image-scale');
    }

    let isToTop = target.matches('.to-top')|| target.closest('.to-top');

    if (isToTop) {
      window.scrollTo(0,0);
    }
  });

  const tables = elems('table');
  if (tables) {
    const scrollable = 'scrollable';
    tables.forEach(function(table) {
      console.log(table);
      const wrapper = createEl();
      wrapper.className = scrollable;
      wrapEl(table, wrapper);
    });
  }
  
  (function makeExternalLinks(){
    let links = elems('a');
    if(links) {
      Array.from(links).forEach(function(link){
        let target, rel, blank, noopener, attr1, attr2, url, isExternal;
        url = elemAttribute(link, 'href');
        isExternal = (url && typeof url == 'string' && url.startsWith('http'))&& !isChild(link, '.page_item') ? true : false;
        if(isExternal) {
          console.log(link);
          target = 'target';
          rel = 'rel';
          blank = '_blank';
          noopener = 'noopener';
          attr1 = elemAttribute(link, target);
          attr2 = elemAttribute(link, noopener);
          
          attr1 ? false : elemAttribute(link, target, blank);
          attr2 ? false : elemAttribute(link, rel, noopener);
        }
      });
    }
  })();
  
}

window.addEventListener('load', fileClosure());
