let imPopup = () => {
	document.addEventListener('click', e => {
		let target = e.target.closest('.im-popup-link');

		if( target ) {
			e.preventDefault();

			let id, ct_open;
			id = '';

			ct_open = document.querySelectorAll('.im-popup._visible').length;
			id = target.getAttribute('data-id');

			if( document.getElementById(id) ){
				if(ct_open == 0){
					let offset = window.innerWidth - document.documentElement.clientWidth;
					document.body.style.overflow = 'hidden';
					document.body.style.paddingRight = offset+'px';
				}
			};

			let href = target.getAttribute('href');
			let staticPopup = target.getAttribute('data-static');
			let afterLoad = target.getAttribute('data-after_load');

			if( href ){
				
				let popupId = 'popup'+Date.now();

				let formData = new FormData();

				let dataset = target.dataset;
				if(dataset){
					for (const field of Object.keys(dataset)) {
						if (field) {
							formData.append(field, dataset[field]);
						}
					}
				}
				
				fetch(
					href, 
					{
						method: 'POST',
						body: formData,
					}
				).then(
					response => response.json()
				).then( 
					response => {
						if(response.result) {
							
							if(response.message){
								let popup = document.createElement('div');
								popup.innerHTML = response.message.trim();
								popup.firstChild.setAttribute('id', popupId);

								document.querySelector('.im-popups').appendChild(popup.firstChild);
		
								if(afterLoad) window[afterLoad](target);
	
								return document.getElementById(popupId).classList.add('_visible');
							}
						} else {
							console.log(response.message);
						}
					}
				);

			} else {
				if(afterLoad) window[afterLoad](target);
				return document.querySelector('.im-popups ' + '#' + id).classList.add('_visible');
			};
		}
	});

	document.addEventListener('click', e => {
		if( e.target.classList.contains('b-popup__close') ) {
			e.preventDefault();
		}
	});	

	document.addEventListener('click', e => {
		if( e.target.closest('.im-popup') ) {
			if (!e.target.closest('.im-popup-inside') || e.target.closest('.b-popup__close')
				|| e.target.closest('js-im-popup-close') ) {

				let el = e.target.closest('.im-popup');
				let id = '#' + el.getAttribute('id');

				if (document.querySelectorAll('.im-popup._visible').length == 1) {
					setTimeout(function() {
						document.body.style.overflow = '';
						document.body.style.paddingRight = '';
					}, 300);
				}

				if(document.querySelector('.im-popup._visible').classList.contains('static')) {
					return document.querySelector('.im-popups ' + id).classList.remove('_visible');
				} else {
					document.querySelector('.im-popups ' + id).classList.remove('_visible');
					setTimeout( function(e) {
						document.querySelector('.im-popups ' + id).remove();
					}, 500);
					return
				};
			}
		}
	});
};

imPopup();
