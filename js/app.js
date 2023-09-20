function biCheckLg(className, size){
    const width = size !== undefined && size !== null && typeof size === 'number' && !isNaN(size) ? size : 24;
    const cls = className !== undefined && className !== null && typeof className ==='string' ? className.trim() : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" fill="currentColor" class="bi bi-check-lg${cls.length > 0 ? ' ' + cls : ''}" viewBox="0 0 16 16">
    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
  </svg>`;
}

const DISMISS_COUNTRY_PICKER_ON_SELECT = true;

$(document).ready(function(){
    console.log('Document ready!');
    let selectedCity = undefined;

    if (window.matchMedia('(display-mode: standalone)').matches) {
        $('body').attr('app-mode', 'installed');
    } else {
        $('body').attr('app-mode', 'browser');
    }

    // from a jQuery collection
    autosize($('textarea.autoExpand'));
    $('#cropYearPickers').attr('placeholder', `${(new Date()).getFullYear()}`)

    function stateCityPickerHtmlContent(selectedCityId){
        const us = USLocations;
        return us.map((state) => {
            const bodyContent = state.cities.map((city) => {
                const content = `<span>${city.name}</span>` + biCheckLg('city-check');
                const isSelected = city.id === selectedCityId;
                dcname = city.name.toLowerCase().trim().replace(' ', '').replace('\n', '').replace('\r', '').replace('\t', '');
                return `<div id="city[${city.id}]" data-city-id="${city.id}" data-name="${dcname}" class="row-content highlightable city-option${isSelected === true ? ' selected' : ''} d-flex justify-content-between align-items-center" role="button">${content}</div>`;
            }).join('<hr>');

            dsname = state.name.toLowerCase().trim().replace(' ', '').replace('\n', '').replace('\r', '').replace('\t', '');
            const header = `<div id="section-state[${state.id}]" data-state-id="${state.id}" data-name="${dsname}" class="form-section-header px-3 pb-1"><span class="form-section-title">${state.name}</span></div>`;
            const body = `<div id="section-body-state[${state.id}]" data-state-id="${state.id}" data-name="${dsname}" class="form-section minimal">${bodyContent}</div>`;
            return header + body;
        }).join('<br>');
    }

    function getCityById(city){
        if(city === undefined || city === null || (typeof city === 'string' && city.trim().length === 0) || (typeof city === 'number' && (isNaN(city) || city < 0))){
            // Remove selected city.
            return undefined;
        } else if(typeof city === 'string') {
            // Set new city as selected.
            const us = USLocations;
            const si = us.findIndex((state) => state.cities.findIndex(cty => cty.id === city) !== -1);
            if(si !== undefined && si !== null && typeof si === 'number' && !isNaN(si) && si >= 0 && si < us.length){
                // Found state of the city.
                const ci = us[si].cities.findIndex(cty => cty.id === city);
                if(ci !== undefined && ci !== null && typeof ci === 'number' && !isNaN(ci) && ci >= 0 && ci < us[si].cities.length){
                    // Found city object.
                    const cityObj = us[si].cities[ci];
                    return cityObj;
                } else {
                    // Couldn't find city's object.
                    return undefined
                }
            } else {
                // Couldn't find the state of the required city.
                return undefined;
            }
        } else if(typeof city === 'object' && city.id !== undefined && city.id !== null){
            return getCityById(city.id);
        } else {
            return undefined;
        }
    }

    function cityIdByElementId(targetId){
        if(targetId === undefined || targetId === null || typeof targetId !== 'string' || targetId.trim().length === 0)
            return undefined;

        const cityIdPrefix = 'city[';
        const i = targetId.indexOf(cityIdPrefix);
        if(i !== undefined && i !== null && typeof i === 'number' && !isNaN(i) && i >= 0 && i < targetId.length){
            const endOfId = targetId.indexOf(']', i+1);
            if(endOfId !== undefined && endOfId !== null && typeof endOfId === 'number' && !isNaN(endOfId) && endOfId >= 0 && endOfId < targetId.length){
                const cityId = targetId.substring(i + cityIdPrefix.length, endOfId);
                return cityId;
            }
        }

        return undefined;
    }

    function setSelectedCity(city){
        const cityObj = getCityById(city);
        if(cityObj !== undefined && cityObj !== null){
            $('#slct-city-btn-title').removeClass('text-muted').text(`${cityObj.state}, ${cityObj.name}`);
            $(`.city-option`).removeClass('selected');
            const selectedEl = Array.from($(`.city-option`)).filter(el => el?.id === `city[${cityObj.id}]`)[0];
            if(selectedEl !== undefined && selectedEl !== null){
                selectedEl.classList.add('selected');
            }
        } else {
            // Remove selected city.
            $('#slct-city-btn-title').addClass('text-muted').text('Select state & city');
        }
    }

    $('#country-picker-list-container').html(stateCityPickerHtmlContent(selectedCity?.id));

    setSelectedCity(selectedCity?.id);
    $('.city-option').click(function(event){
        if(event === undefined || event === null || typeof event.target !== 'object')
            return;

        const cityId = cityIdByElementId(event.target?.id);
        if(cityId !== undefined && cityId !== null){
            setSelectedCity(cityId);
            if(DISMISS_COUNTRY_PICKER_ON_SELECT === true){
                $("#country-picker-screen .navbar-back").trigger('click');
            }
        }
    })

    $('#city-search-input').on('input', function (e) {
        if(this.value === undefined || this.value === null || typeof this.value !== 'string' || this.value.trim().length === 0){
            // Empty input.
            $('.city-option').removeClass('force-hide');
            $('#country-picker-list-container > .form-section').removeClass('force-hide');
        } else {
            const search = this.value.toLowerCase().trim().replace(' ', '').replace('\n', '').replace('\r', '').replace('\t', '');
            $('#country-picker-list-container > .form-section').addClass('force-hide');
            $('.city-option').addClass('force-hide').filter('[data-name*="' + search + '"]').removeClass('force-hide').parent('.form-section').removeClass('force-hide');
            $('#country-picker-list-container > .form-section').filter('[data-name*="' + search + '"]').removeClass('force-hide').children().removeClass('force-hide');
        }
      
    });


    $("#cropYearPicker").datepicker({
        format: "yyyy",
        viewMode: "years",
        startView: "years",
        minViewMode: "years",
        maxViewMode: "years",
        clearBtn: false,
        autoclose: true,
        todayHighlight: false,
        datesDisabled: [],
        toggleActive: true
    });

    $("#phoneNumberInput").intlTelInput({
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/8.4.6/js/utils.js"
      });

    $("#sbmt").click(function(){
        console.log('Clicked!');
        let emailSubject = 'Subject';
        let emailBody = 'Body';
        window.location.href = "mailto:support@example.com?subject=" + emailSubject + "&body=" + emailBody;
        return "_blank";
    });

    const toggleDisplay = function(selector, duration, callback){
        if($(selector).hasClass('d-none')){
            if($(selector).hasClass('d-block')){
                return $(selector).removeClass('d-none', duration, callback);
            } else {
                return $(selector).removeClass('d-none', 0, () => {
                    return $(selector).addClass('d-block', duration, callback);
                })
            }
        } else if(!($(selector).hasClass('d-block'))){
            return $(selector).addClass('d-block', duration, callback);
        } else {
            return $(selector);
        }
    }

    const toggleVisibility = function(selector, duration = 200){
        if($(selector).hasClass('visible')){
            // Already visile, make it invisible.
            $(selector).removeClass('visible');
        } else {
            // Its's not visible, make it visible
            $(selector).addClass('visible', duration, 'easeInQuad');
        }
        // if($(selector).hasClass('invisible')){
        //     // Has invisible, make visible.
        //     if($(selector).hasClass('visible')){
        //         // Has both visible and invisible, make visible.
        //         $(selector).removeClass('invisible', duration).addClass('bg-dark');
        //     } else {
        //         $(selector).removeClass('d-none').addClass('d-block').addClass('visible', duration, 'easeInQuad').removeClass('invisible');
        //         // toggleDisplay(selector, 1, () => {
        //         //     $(selector).removeClass('invisible', () => {
        //         //         $(selector).addClass('visible', duration, 'easeInQuad');
        //         //     });
        //         // });
        //     }
        // } else if($(selector).hasClass('visible')){
        //     // Has no invisible, and has visible, make invisible.
        //     $(selector).removeClass('visible').removeClass('d-none').addClass('d-block').addClass('invisible', duration, 'easeInQuad');
        // } else {
        //     // Has no invisible, and has no visible, make invisible.
        //     $(selector).addClass('invisible bg-dark', 2000);
        // }
    }

    $("#slct-city-btn").click(function(){
        
        toggleVisibility('#country-picker-screen');

        const elm = Array.from($('#country-picker-screen .city-option.selected'))[0];
        elm && elm.scrollIntoView({block: 'center'});

        // const slctd = $('#country-picker-screen');
        // slctd && $('html, body').scrollTop(slctd.offset().top);
    });

    $("#country-picker-screen .navbar-back").click(function(){
        toggleVisibility('#country-picker-screen');
        $('#country-picker-screen #city-search-input').val('').trigger('input').blur();
    });
});