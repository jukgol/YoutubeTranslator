// Electron/renderer/js/download/selectionHandler.js

// Global variable removed

export function applyHighlight(element) {
    if (element) {
        element.classList.add('selected');
    }
}

export function removeHighlight(element) {
    if (element) {
        element.classList.remove('selected');
    }
}

export function createItemClickHandler() {
    let selectedElementInThisHandler = null; // 각 createItemClickHandler 인스턴스마다 고유한 변수

    return function handleItemClick(clickedElement, type, sectionName, data) {
        let elementToHighlight = clickedElement;

        // 이전에 선택된 요소가 있고, 그것이 현재 클릭된 요소와 다르다면
        if (selectedElementInThisHandler && selectedElementInThisHandler !== elementToHighlight) {
            removeHighlight(selectedElementInThisHandler); // 이전 선택 요소의 하이라이트 제거
        }

        applyHighlight(elementToHighlight); // 현재 클릭된 요소 하이라이트 적용
        selectedElementInThisHandler = elementToHighlight; // 현재 클릭된 요소를 새 선택 요소로 저장

        // Store context in dataset for future reference
        elementToHighlight.dataset.sectionName = sectionName;
        elementToHighlight.dataset.type = type;
        elementToHighlight.dataset.data = JSON.stringify(data);


    };
}
