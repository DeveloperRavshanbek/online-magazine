$(document).ready(function () {
  const storage = {
    get: function (name = '') {
      return JSON.parse(localStorage.getItem(name));
    },
    set: function (name = "", value = '') {
      localStorage.setItem(name, JSON.stringify(value))
    },
    remove: function (name = '') {
      localStorage.removeItem(name);
    }
  }
  // var freeshopSlider = $('.freeshop-slider');
  // var popularSlider = $('.popular-slider');
  // var galleryTop = $('.gallery-top');
  // Swiper JS

  const freeshopSlider = new Swiper('.freeshop-slider', {
    pagination: {
      el: '.freeshop-slider .swiper-pagination',
      loop: true,
      clickable: true,
    },
  });



  const popularSlider = new Swiper('.popular-slider', {
    slidesPerView: 4,
    spaceBetween: 20,
    loop: true,
    navigation: {
      prevEl: '.popular-navigation .swiper-button-prev',
      nextEl: '.popular-navigation .swiper-button-next',
    }
  });


  const galleryTop = new Swiper('.gallery-top', {
    spaceBetween: 10,
    navigation: {
      nextEl: '.product-next',
      prevEl: '.product-prev',
    }
  });


  // Range

  var priceRange = document.getElementById('price-range');
  priceInput = document.querySelectorAll('.result input')
  if (priceRange) {
    noUiSlider.create(priceRange, {
      start: [0, 70000],
      connect: true,
      range: {
        'min': 1000,
        'max': 100000
      },
      step: 1000
    })

    priceRange.noUiSlider.on('update', function (values, handle) {
      priceInput[0].value = values[0];
      priceInput[1].value = values[1];
    })
  }

  // JS CODE
  const api_root = 'https://fakestoreapi.com';
  const wrapper = $('.content-wrapper');
  const mainContent = $('.main-content');
  const product = $('.product');
  let localCart = [];


  const minusBtns = document.querySelectorAll('.counter .minus');
  // console.log(minusBtns);
  const plusBtns = document.querySelectorAll('.counter .plus');
  const tabLinks = document.querySelectorAll("[data-menu-id]");
  // const closeBtn = document.querySelector('.close');
  var valueId = null;
  const path = window.location.pathname;
  if (path.includes('index')) {
    sendRequest('/products', getData);
  } else
    if (path.includes('about')) {
      const urlParams = new URLSearchParams(window.location.search);
      valueId = parseInt(urlParams.get('id'));
      if (Number.isInteger(valueId)) {
        sendRequest('/products/' + valueId, getItem, false)
      }
    } else
      if (path.includes('shop-card')) {
        localCart = storage.get('products');
        localCart.forEach(function (item, index) {
          sendRequest('/products/' + item.id, shopCard)
        })
      } else
        if (path.includes("categories")) {
          sendRequest('/products/', getFilter);
          sendRequest('/products/categories', categories)
        }



  minusBtns.forEach(function (minusButton) {
    minusButton.addEventListener('click', function () {
      const resultCounter = minusButton.parentNode.querySelector('input');
      const val = parseInt(resultCounter.value)
      resultCounter.value = val === 1 ? 1 : val - 1;
      const tr = minusButton.closest('tr');
      if (tr) {
        const totalPrice = tr.querySelector('.total-money');
        const productPrice = parseInt(resultCounter.getAttribute('data-money'));
        const productAmount = parseInt(resultCounter.value);
        totalPrice.innerHTML = "$" + (productPrice * productAmount);
      }
      const products = storage.get('products') || [];
      products.forEach(function (item, index) {
        if (item.id == valueId) {
          products[index] = {
            id: item.id,
            count: resultCounter.value
          }
        }
        // const rem = storage.remove(item);
      })
      storage.set('products', products);

      //  if(){
      //    storage.remove(resultCounter.value)
      //    storage.set('products');
      //  }
    })
  })

  plusBtns.forEach(function (plusButton) {
    plusButton.addEventListener('click', function () {
      const resultCounter = plusButton.parentNode.querySelector('input');
      const tr = plusButton.closest('tr');
      resultCounter.value = parseInt(resultCounter.value) + 1;
      if (tr) {
        const totalPrice = tr.querySelector('.total-money')
        const productPrice = parseInt(resultCounter.getAttribute('data-money'));
        const productAmount = parseInt(resultCounter.value);
        totalPrice.innerHTML = "$" + (productPrice * productAmount);
      }
      const products = storage.get('products') || [];
      products.forEach(function (item, index) {
        if (item.id == valueId) {
          products[index] = {
            id: item.id,
            count: resultCounter.value
          }
        }
        // const rem = storage.remove(item);
      })
      storage.set('products', products);
    })


  })

  if (tabLinks.length) {

    tabLinks.forEach(function (tabMenu) {
      tabMenu.addEventListener('click', function () {
        tabLinks.forEach(function (item) {
          item.classList.remove('active');
        });
        tabMenu.classList.add('active');
        const menuId = tabMenu.getAttribute('data-menu-id');
        if (menuId) {
          const content = document.querySelector('[data-content-id="' + menuId + '"]')
          const prevContent = document.querySelector('.comment-info.active');
          if (prevContent) {
            prevContent.classList.remove('active');
          }
          content.classList.add('active');
        }
      })

    })

    tabLinks[0].click();

  }

  $('.social').on('click', function () {
    $(this).toggleClass('active');
  })
  // REST API


  // sendRequest("/products?limit=20", getData)
  function sendRequest(path = '', cb) {
    $.ajax(api_root + path, {
      beforeSend: function () {
        cb(false);
      }
    })
      .fail(function (data) {
        cb(true, data, true)
        // console.log(data);
      })
      .done(function (data) {
        cb(true, data);
        // console.log(data);
      })
  }

  function categories(isFetched = true, data = [], errorMessage = false){
    $('.item_list').html('')
    var error = `<h1>NOT FOUND 404</h1>`
    if (errorMessage) {
      wrapper.append(error)
    } else if (isFetched === false && !data.length) {
      console.log(data)
    } else if (isFetched && data.length) {
      console.log(data);
      var success = '<li class="all-link">All</li>'
      $('.item_list').append(success)
      $('.item_list').find('.all-link').on('click', function(){
        sendRequest('/products/', getFilter);
      })
      $(data).each(function (index, item) {
        var html = '<li class="item-link" data-index="' + index + '">%categories%</li>';
        html = html.replace('%categories%', item.toUpperCase());
        $('.item_list').append(html)

        $('.item_list').find('.item-link[data-index="' + index +'"]').on('click', function(){
          sendRequest('/products/category/'+item, getFilter);
        })
        
      })
  }
}
  function getFilter(isFetched = true, data = [], errorMessage = false) {
    $('.get-filter').html('');

    var spin =
      `<div class="spinner d-flex text-center justify-content-center">` +
      `<div class="spinner-border text-primary" style="width: 6rem; height: 6rem;" role="status">` +
      `<span class="sr-only">Loading...</span>` +
      `</div>` +
      `</div>`;
    var error = `<h1>NOT FOUND 404</h1>`
    if (errorMessage) {
      $('.get-filter').append(error)
    } else if (isFetched === false && !data.length) {
      $('.get-filter').append(spin)
    } else if (isFetched && data.length) {
      $(data).slice(0, 16).each(function (index, item) {
        var html = '<div class="col-md-3">'+
        '<div class="gallery_card swiper-slide">'+
        '<a href="#!" class="popular-item">'+
        '<div class="popular-img" style="background-image: url(%img%)"></div>'+
        '<span>%title%</span>'+
        '<div class="money">$%price%</div>'+
        '<img src="./img/star.png" alt=""></img>'+
        '</a>'+
        '<div class="popular-blog">'+
        '<a href="#!"><i class="fas fa-shopping-cart"></i></a>'+
        '<a href="#!"><i class="fas fa-heart"></i></a>'+
        '<a href="#!"><i class="fas fa-retweet"></i></a>'+
        '</div>'+
        '</div>'+
        '</div>';

        html = html.replace('%id%', item.id)
        html = html.replace('%img%', item.image);
        html = html.replace('%title%', item.category);
        html = html.replace('%price%', item.price);

        $('.get-filter').append(html)
      })
  }
  }
  function getData(isFetched = true, data = [], errorMessage = false) {
    $(wrapper).html('');

    var spin =
      `<div class="spinner d-flex text-center justify-content-center">` +
      `<div class="spinner-border text-primary" style="width: 6rem; height: 6rem;" role="status">` +
      `<span class="sr-only">Loading...</span>` +
      `</div>` +
      `</div>`;
    var error = `<h1>NOT FOUND 404</h1>`
    if (errorMessage) {
      wrapper.append(error)
    } else if (isFetched === false && !data.length) {
      wrapper.append(spin)
    } else if (isFetched && data.length) {
      $(data).slice(0, 5).each(function (index, item) {
        var html = '<div class="gallery_card swiper-slide">' +
          '<a href="./about.html?id=%id%" class="popular-item">' +
          '<div class="popular-img" style="background-image: url(%img%)"></div>' +
          '<span>%category%</span>' +
          '<div class="money">$%price%</div>' +
          '<img src="./img/star.png" alt=""></img>' +
          '</a>' +
          '<div class="popular-blog">' +
          '<a href="#!"><i class="fas fa-shopping-cart"></i></a>' +
          '<a href="#!"><i class="fas fa-heart"></i></a>' +
          '<a href="#!"><i class="fas fa-retweet"></i></a>' +
          '</div>' +
          '</div>';

        html = html.replace('%id%', item.id)
        html = html.replace('%img%', item.image);
        html = html.replace('%category%', item.category);
        html = html.replace('%price%', item.price);

        if ($('.popular-slider').length) {
          popularSlider.appendSlide(html);
        }
      })
      $(data).slice(5, 15).each(function (_, item) {
        var html2 = '<div class="col-five">' +
          '<div class="gallery_card" >' +
          '<a href="./about.html?id=%id%" class="popular-item swiper-slide">' +
          '<div class="popular-img" style="background-image: url(%img%)"></div>' +
          '<span>%category%</span>' +
          '<div class="money">$%price%</div>' +
          '<img src="./img/star.png" alt=""></img>' +
          '</a>' +
          '<div class="popular-blog">' +
          '<a href="#!"><i class="fas fa-shopping-cart"></i></a>' +
          '<a href="#!"><i class="fas fa-heart"></i></a>' +
          '<a href="#!"><i class="fas fa-retweet"></i></a>' +
          '</div>' +
          '</div >' +
          '</div >';
        html2 = html2.replace('%id%', item.id)
        html2 = html2.replace('%img%', item.image);
        html2 = html2.replace('%category%', item.category);
        html2 = html2.replace('%price%', item.price);
        mainContent.append(html2);

      })

    } else {
      console.log('NOT FOUND 404');
    }
  }

  function getItem(isFetched = true, data = {}, errorMessage = false) {
    $(product).html("");
    var spin =
      `<div class="d-flex justify-content-center m-5">` +
      `<div class="spinner-border text-primary" style="width: 6rem; height: 6rem;" role="status">` +
      `<span class="sr-only">Loading...</span>` +
      `</div>` +
      `</div>`;

    if (isFetched === false && !Object.keys(data).length) {
      // $(singleMovie).html('Loading...');
      product.append(spin)
    } else if (isFetched && Object.keys(data).length) {
      var html = '<div class="swiper-slide product-img-top" style="background-image: url(%img%)">' +
        '</div>';
      html = html.replace('%img%', data.image);

      $(product).append(html);

      var html2 = '<div class="product-info">' +
        '<div class="product-name">%category%</div>' +
        '<div class="product-blog">' +
        '<div class="product-money">$%price%</div>' +
        '<img src="./img/star.png" alt=""/>' +
        '</div>' +
        '<p>%description%</p>' +
        '</div>';

      html2 = html2.replace('%category%', data.title);
      html2 = html2.replace('%price%', data.price);
      html2 = html2.replace('%description%', data.category);

      $('.content').append(html2)

      var comment = '<p>%description%</p>'
      comment = comment.replace('%description%', data.description);
      $('.comment-info').append(comment)
      let massiv = JSON.parse(localStorage.getItem('products')) || [];
      // console.log(massiv);
      $(massiv).each(function (_, item) {
        if (item['id'] === data.id) {
          $('.product-contact button').attr('disabled', true);
        }
      })
      // if(massiv.includes(data.id)){
      //   $('.product-contact button').attr('disabled', true);
      // }else{
      //   $('.product-contact button').attr('disabled', false);
      // }
      $('.product-contact button').on('click', function () {
        $(this).attr('disabled', true);

        let objItem = {
          id: data.id,
          count: parseInt($('.counter input').val())
        }
        massiv.push(objItem);

        console.log(massiv)

        localStorage.setItem('products', JSON.stringify(massiv));

      })
    } else {
      console.log(1);
    }
  }


  function shopCard(isFetched = true, data = {}, errorMessage = false) {
    var tr = document.createElement('tr')
    $(tr).html('')
    var spin =
      `<div class="spinner d-flex text-center justify-content-center">` +
      `<div class="spinner-border text-primary" style="width: 6rem; height: 6rem;" role="status">` +
      `<span class="sr-only">Loading...</span>` +
      `</div>` +
      `</div>`;
    var error = '<h1>NOT FOUND 404</h1>';

    if (isFetched === false && !Object.keys(data).length) {
      $(tr).append(spin)
    } else if (isFetched && Object.keys(data).length) {
      const num = localCart.find(function (a) {
        return a.id === data.id
      });
      var html = '<td>' +
        '<div class="shop-item d-flex">' +
        '<div class="shop-img" style="background-image: url(%img%)"></div>' +
        ' <p>%title%</p>' +
        ' </div>' +
        '</td>' +
        '<td>' +
        '<p>' +
        'Size: XL <br />' +
        'Color: Black' +
        '</p>' +
        '</td>' +
        '<td>' +
        '<div class="counter">' +
        '<button class="minus count" type="button">-</button>' +
        '<input type="text" value="%count%" class="counter-result" readonly data-money="' + data.price + '"/>' +
        '<button class="plus count" type="button">+</button>' +
        '</div>' +
        '</td>' +
        '<td>' +
        '<p class="price-money">$%price%</p>' +
        '</td>' +
        '<td>' +
        '<div class="shop-filter d-flex justify-content-between">' +
        '<p class="total-money">$%allprice%</p>' +
        '<div class="close" data-index="' + data.id + '"><i class="fas fa-window-close"></i></div>' +
        '</div>' +
        '</td>';

      html = html.replace('%count%', num.count)
      html = html.replace('%img%', data.image);
      html = html.replace('%title%', data.title);
      html = html.replace('%price%', data.price)
      html = html.replace('%allprice%', (data.price * num.count).toFixed(2))

      $(tr).append(html);
      $('tbody').append(tr);
      // popularSlider.appendSlide(html);
      $(tr).find('.close[data-index="' + data.id + '"]').on('click', function (e) {
        const products = storage.get('products') || [];
        var newarr = []
        products.forEach(function (item) {
          if (item.id === data.id) {
            $(tr).remove()
          } else {
            newarr.push(item)
          }
        })
        storage.set('products', newarr)
      })
      // MINUS BUTTON
      $(tr).find('.counter .count').on('click', function (e) {
        const resultCounter = $(tr).find('.counter-result');
        const value = parseInt(resultCounter.val())
        const totalPrice = $(tr).find('.total-money');
        const productPrice = parseFloat(resultCounter.attr('data-money'));
        if ($(this).hasClass('minus')) {
          resultCounter.val(value === 1 ? 1 : value - 1);
        } else {
          resultCounter.val(value + 1);
        }
        totalPrice.html("$" + (productPrice * parseInt(resultCounter.val())).toFixed(2));
        localCart.forEach(function (item, index) {

          if (item.id === data.id) {
            localCart[index] = {
              id: item.id,
              count: parseInt(resultCounter.val())
            }
          }
        })
        storage.set('products', localCart);
      })

      // PLUS BUTTON


    } else {
      $(tr).append(error)
    }
    // function test() {
    //   console.log("");
    // }
  }
})

