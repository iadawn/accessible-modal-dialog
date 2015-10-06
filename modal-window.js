/*
 
 ============================================
 License for Application
 ============================================
 
 This license is governed by United States copyright law, and with respect to matters
 of tort, contract, and other causes of action it is governed by North Carolina law,
 without regard to North Carolina choice of law provisions.  The forum for any dispute
 resolution shall be in Wake County, North Carolina.
 
 Redistribution and use in source and binary forms, with or without modification, are
 permitted provided that the following conditions are met:
 
 1. Redistributions of source code must retain the above copyright notice, this list
 of conditions and the following disclaimer.
 
 2. Redistributions in binary form must reproduce the above copyright notice, this
 list of conditions and the following disclaimer in the documentation and/or other
 materials provided with the distribution.
 
 3. The name of the author may not be used to endorse or promote products derived from
 this software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
 WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
 AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 */

// Selector to search for focusable items
var focusableElementsString = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]";

// Store the item that has focus before opening the modal window
var focusedElementBeforeModal;

// Store the currently open modal id
var openModalId;

(function() {
  // Find all modal window triggers
  var modalTriggers = document.querySelectorAll('.modal-open');
  
  // Add a modal overlay to indicate that the rest of the page is unavailable.
  // The same overlay is used for every modal window
  var modalOverlay = document.createElement('div');
  modalOverlay.setAttribute('id', 'modal-overlay');
  modalOverlay.setAttribute('class', 'modal-overlay');
  document.getElementsByTagName("body")[0].appendChild(modalOverlay);
  
  // Any clicks on the modal overlay will close the modal window
  modalOverlay.addEventListener('click', hideModal);

  // For each trigger...
  Array.prototype.forEach.call(modalTriggers, function(el, i) {
    // Add class and aria attributes to the modal holder
    modalHolder = getById(el.id + '-holder');
    modalHolder.classList.add('modal-holder');
    modalHolder.setAttribute('role','dialog');
    modalHolder.setAttribute('aria-labelledby', el.id + '-title');
    modalHolder.setAttribute('aria-describedby', el.id + '-desc');
    modalHolder.setAttribute('aria-hidden', 'true');
    modalHolder.setAttribute('tabindex', '-1');

    // Add a description into the modal
    var modalDesc = document.createElement('div');
    modalDesc.setAttribute('id', el.id + '-desc');
    modalDesc.setAttribute('class', 'modal-desc');
    modalDesc.innerHTML = 'Beginning of dialog window. Escape will cancel and close the window.';
    modalHolder.insertBefore(modalDesc, modalHolder.firstChild);
    
    // Add class for the modal title
    modalTitle = getById(el.id + '-title');
    modalTitle.classList.add('modal-title');

    // Add a close button, with an click trigger to close
    var closeButton = document.createElement('button');
    closeButton.setAttribute('class', 'btn-close');
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('aria-label', 'close');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', hideModal);
    modalHolder.appendChild(closeButton);
    
    // Add a listener to deal with opening the modal
    el.addEventListener('click', showModal)
    
    // Move the modal holder to the bottom of the document. This prevents screen readers
    // from reading forward beyond the end of the modal. It is unclear if this is
    // necessary as a result of a limitation of screen readers in dealing with
    // elements marked with role='dialog'
    document.getElementsByTagName("body")[0].appendChild(modalHolder);
  });
}).call(this);

// Write less code
function getById ( id ) {
  return document.getElementById(id);
}

// Open the modal window
function showModal(e) {
  var modalHolder = getById(this.id + '-holder');

  // Save the open modal window id
  openModalId = this.id;

  // Save the element currently with focus
  focusedElementBeforeModal = document.activeElement;

  // Mark the main content as hidden
  document.getElementsByTagName("main")[0].setAttribute('aria-hidden', 'true');
  
  // Display the overlay
  getById('modal-overlay').style.display = 'block';

  // Display the modal window
  modalHolder.setAttribute('aria-hidden', 'false');
  
  // Add a listener to deal with pressing the escape key to close the window
  document.addEventListener('keydown', escapeKeyToClose);

  // Add a keydown listener to modal to manage the tab key within the modal
  modalHolder.addEventListener('keydown', containTabKey);
  
  // Set focus to the modal window
  modalHolder.focus();
  e.preventDefault();
}

// Close the modal window
function hideModal(e) {
  var modalHolder = getById(openModalId + '-holder');
  
  // Clear the open modal window id
  openModalId = null;

  // Mark the main page as visible
  document.getElementsByTagName("main")[0].setAttribute('aria-hidden', 'false');
  
  // Hide the overlay
  getById('modal-overlay').style.display = 'none';

  // Hide the modal window
  modalHolder.setAttribute('aria-hidden', 'true');

  // Remove the escape key listener
  document.removeEventListener('keydown', escapeKeyToClose);

  // Remove keydown listener to modal to manage the tab key within the modal
  modalHolder.removeEventListener('keydown', containTabKey);

  // Return focus to the opening element
  focusedElementBeforeModal.focus();
  focusedElementBeforeModal = null;
  e.preventDefault();
}

// Contain the tab key within the modal window
function containTabKey(e) {
  // If the tab key is pressed
  if(e.keyCode == 9) {
    var modal = getById(openModalId + '-holder');
    var canTakeFocus = [];
    var focusableNodes = modal.querySelectorAll(focusableElementsString);
    for(var i = focusableNodes.length; i--; canTakeFocus.unshift(focusableNodes[i]));
    var currentFocus = canTakeFocus.indexOf(document.activeElement);
    
    // If the shift key is pressed with tab
    if(e.shiftKey) {
      // If the first tabable item in the modal has focus, cycle round to the last item
      if(currentFocus == 0) {
        canTakeFocus[canTakeFocus.length - 1].focus();
      }
      // Otherwise, go to the previous item
      else {
        canTakeFocus[currentFocus - 1].focus();
      }
    } else {
      // If the last tabable item in the modal has focus, cycle round to the first item
      if(currentFocus == canTakeFocus.length - 1 ) {
        canTakeFocus[0].focus();
      }
      // Otherwise, go to the next item
      else {
        canTakeFocus[currentFocus + 1].focus();
      }
    }
    // We have dealt with the tab function, so do nothing more
    e.preventDefault();
  }
}

// If the escape key is pressed, close any open modal window
function escapeKeyToClose(e) {
  // if escape pressed
  if(e.keyCode == 27) {
    hideModal(e);
    e.preventDefault();
  }
}
