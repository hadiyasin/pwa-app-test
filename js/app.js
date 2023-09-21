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
    let phoneNumberCountry = undefined;
    let phoneNumber = undefined;

    if (window.matchMedia('(display-mode: standalone)').matches) {
        $('body').attr('app-mode', 'installed');
    } else {
        $('body').attr('app-mode', 'browser');
    }

    // from a jQuery collection
    autosize($('textarea.autoExpand'));
    $("#cropYearPickers").inputSpinner({editor: customEditors.RawEditor});
    $('#cropYearPickers').attr('placeholder', `${(new Date()).getFullYear()}`);
    $('#cropYearPickers').val(`${(new Date()).getFullYear()}`);

    const prevForm = getFormFromLocalStorage();
    if(prevForm !== undefined && prevForm !== null && Array.isArray(prevForm)){
        //console.log('previous session:', prevForm);
        const cropYear = prevForm.find(dt => dt.name === 'crop-year');
        const fullname = prevForm.find(dt => dt.name === 'name');
        const _phoneNumber = prevForm.find(dt => dt.name === 'phone');
        const _phoneNumberCountry = prevForm.find(dt => dt.name === 'phone-info');
        const policyNumber = prevForm.find(dt => dt.name === 'policy-number');

        cropYear && cropYear.value && $('#cropYearPickers').val(cropYear.value);
        fullname && fullname.value && $('#nameInput').val(fullname.value);
        _phoneNumber && _phoneNumber.value && $('#phoneNumberInput').val(_phoneNumber.value);
        policyNumber && policyNumber.value && $('#policyNumberInput').val(policyNumber.value);
        phoneNumberCountry = _phoneNumberCountry?.value;
        phoneNumber = _phoneNumber?.value;
    }

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

    function getCityStateString(){
        const city = selectedCity?.name;
        const state = selectedCity?.state;
        const cityState = [state, city].filter(s => s !== undefined && s !== null && typeof s === 'string' && s.trim().length !== 0).join(', ');
        if(cityState !== undefined && cityState !== null && typeof cityState === 'string' && cityState.trim().length > 0)
            return cityState;
    }

    function setSelectedCity(city){
        const cityObj = getCityById(city);
        if(cityObj !== undefined && cityObj !== null){
            selectedCity = cityObj;
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

    const phoneNumberInput = window.intlTelInput($("#phoneNumberInput").get(0), {
        autoPlaceholder: 'polite',
        nationalMode: true,
        separateDialCode: false,
        // placeholderNumberType: 'FIXED_LINE_OR_MOBILE',
        initialCountry: (function(code){
            if(code !== undefined && code !== null){
                if(typeof code === 'string' && code.trim().length > 0){
                    return code.trim();
                } else if(typeof code === 'object' && Object.keys(code).length > 0 && code.iso2){
                    return typeof code.iso2 === 'string' && code.iso2.trim().length > 0 ? code.iso2.trim() : '';
                } else {
                    return '';
                }
            } else {
                return '';
            }
        })(phoneNumberCountry),
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/8.4.6/js/utils.js"
    });

    phoneNumberInput && phoneNumberInput.setNumber && phoneNumberInput.setNumber(phoneNumber);

    $("#phoneNumberInput").on('input', function(e){
        const placeholder = e?.target?.placeholder;
        if(placeholder === undefined || placeholder === null || 
            (typeof placeholder === 'string' && placeholder.trim().length === 0) || 
            (typeof placeholder === 'number')){
            return;
        }

        const ptrn = `${placeholder}`.replace(/[0-9]/g, '0');
        //const pls = `${placeholder}`.replace(/[0-9]/g, '_');
        $(this).mask(ptrn);

        const form = $(this).closest('form');
        if(form && form.hasClass && form.hasClass('was-validated'))
            validatePhoneNumber(this);

        //console.log('placeholder:', e.target.placeholder, 'pattern:', ptrn, 'placeholder:', pls);
    });

    function validatePhoneNumber(input, checkOnly){
        if(input === undefined || input === null)
            return true;

        const iti = window?.intlTelInputGlobals?.getInstance(input);
        if(iti === undefined || iti === null)
            return true;

        const errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];
        let isValid = true;
        let errorMessage = undefined;
        if(input.value.trim().length === 0) {
            if(input.required === true){
                isValid = false;
                errorMessage = 'Please enter a phone number';
            } else {
                // Field is empty, and not required.
                isValid = true;
            }
        } else if(iti.isValidNumber()){
            // It's valid.
            isValid = true;
        } else {
            isValid = false;
            const errorCode = iti.getValidationError();
            errorMessage = errorMap[errorCode];
        }

        if(checkOnly === true){
            return isValid;
        }

        const validMsg = $(input).closest('.input-field,.input-group').children('.valid-feedback').get(0);
        const errorMsg = $(input).closest('.input-field,.input-group').children('.invalid-feedback').get(0);

        if(isValid === true){
            input.classList.remove("invalid");
            input.setCustomValidity(errorMessage ?? '');

            if(validMsg){
                validMsg.classList.remove("hide");
                validMsg.classList.add("checked");
            }
            if(errorMsg){
                errorMsg.innerHTML = '';
                errorMsg.classList.add('hide');
                errorMsg.classList.remove("checked");
            }
        } else {
            input.classList.add("invalid");
            input.setCustomValidity(errorMessage ?? '');

            if(errorMsg){
                if(errorMessage !== undefined && errorMessage !== null && (typeof errorMessage !== 'string' || errorMessage.trim().length > 0)){
                    errorMsg.innerHTML = errorMessage;
                    errorMsg.classList.remove("hide");
                    errorMsg.classList.add("checked");
                } else {
                    errorMsg.innerHTML = '';
                    errorMsg.classList.add('hide');
                    errorMsg.classList.remove("checked");
                }
            }

            if(validMsg){
                validMsg.classList.add('hide');
                validMsg.classList.remove("checked");
            }
        }

        return isValid;
    }

    $("#sbmt").click(function(e){
        const form = $(this).closest('form.needs-validation').get(0);
        const cityState = getCityStateString();

        if(!form || form === undefined || form === null){
            e.preventDefault();
            e.stopPropagation();
            return;
        } else if (!form.checkValidity() || !cityState || !validatePhoneNumber($('#phoneNumberInput').get(0), true)) {
            e.preventDefault();
            e.stopPropagation();
            validatePhoneNumber($('#phoneNumberInput').get(0))
            form.classList.add('was-validated');
            return;
        } else {
            form.classList.add('was-validated')
        }

        let formData = Array.from($(".screen.home form").serializeArray());
        if(formData !== undefined && formData !== null && typeof formData === 'object' && !Array.isArray(formData)){
            const cityState = getCityStateString();
            if(cityState !== undefined && cityState !== null && typeof cityState === 'string' && cityState.trim().length > 0)
                formData['city'] = cityState;
                formData['city-id'] = selectedCity?.id;
        } else if(formData !== undefined && formData !== null && Array.isArray(formData)){
            const cityState = getCityStateString();
            if(cityState !== undefined && cityState !== null && typeof cityState === 'string' && cityState.trim().length > 0){
                formData.push({name: 'city', value: cityState});
                formData.push({name: 'city-id', value: selectedCity?.id});
            }
        }

        if(phoneNumberInput !== undefined && phoneNumberInput !== null && phoneNumberInput.getNumber && phoneNumberInput.getSelectedCountryData){
            const phoneNumber = phoneNumberInput.getNumber();
            const country = phoneNumberInput.getSelectedCountryData();
            const nmbrType = phoneNumberInput.getNumberType ? phoneNumberInput.getNumberType() : undefined;
            if(country && typeof country === 'object' && Object.keys(country).length > 0){
                if(nmbrType !== undefined && nmbrType !== null){
                    if(typeof nmbrType === 'string'){
                        nmbrType && (country['number-type'] = nmbrType);
                    } else if(typeof nmbrType === 'number' && !isNaN(nmbrType)){
                        if(window.intlTelInputUtils && window.intlTelInputUtils.numberType && 
                            typeof window.intlTelInputUtils.numberType === 'object'){
                                const nmbrTypStr = Object.keys(window.intlTelInputUtils.numberType).filter(key => {
                                    return window.intlTelInputUtils.numberType[key] === nmbrType;
                                })[0];
                                if(nmbrTypStr !== undefined && nmbrTypStr !== null && typeof nmbrTypStr === 'string' 
                                && nmbrTypStr.trim().length > 0){
                                    country['number-type'] = nmbrTypStr
                                }
                        }
                    }
                }
                
                formData.push({name: 'phone-info', value: country});
                const pi = formData && Array.isArray(formData) ? formData.findIndex(fd => fd.name === 'phone') : -1;
                pi >= 0 && (formData[pi] = {...formData[pi], value: phoneNumber});
                console.log('phoneNumber:', phoneNumber, 'country:', country);
            }
        }

        console.log(formData);
        let emailSubject = 'Commodity Ticket Information';
        const finalFormData = formData.filter(fd => fd.name !== 'city-id' && fd.name !== 'phone-info' && fd.value !== undefined && fd.value !== null && `${fd.value}`.trim().length > 0).map((fd) => `${fd.name}: ${fd.value};`).join('%0D%0A');
        let emailBody = finalFormData;//JSON.stringify(finalFormData);
        

        saveFormInLocalStorage(formData);
        window.location.href = "mailto:graintickets@sompo-intl.com?subject=" + emailSubject + "&body=" + emailBody;
        return "_blank";
    });

    function saveFormInLocalStorage(form){
        if(form === undefined && form === null || (typeof form === 'number' && isNaN(form)) || (typeof form === 'string' && form.trim().length === 0)){
            // Clear storgae.
            localStorage?.removeItem('ticket-form-data');
        } else {
            // Save into storage.
            localStorage?.setItem('ticket-form-data', JSON.stringify(form));
        }
    }

    function getFormFromLocalStorage(){
        const data = localStorage?.getItem('ticket-form-data');
        if(data === undefined || data === null || typeof data !== 'string' || data.trim().length === 0){
            return undefined;
        } else {
            try {
                return JSON.parse(data);
            } catch {
                return undefined;
            }
        }
    }

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