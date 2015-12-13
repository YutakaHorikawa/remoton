var dragElm = null;

class DragObj {
    constructor(elm) {
        this.elm = elm;
        this._bind();
    }

    _bind() {
        this.elm.addEventListener('dragstart', this.handleDragStart, false);
        this.elm.addEventListener('dragover', this.handleDragOver, false);
        this.elm.addEventListener('drop', this.handleDrop, false);
    }

    handleDragStart(e) {
        this.elm.style.opacity = '0.4';
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        e.dataTransfer.dropEffect = 'move';

        return false;
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation(); 
        }
        return false;
    }

     handleDragStart(e) {
        dragElm = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation(); 
        }

        if (dragElm != this) {
            dragElm.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');
        }

        return false;
    }
}

var cols = document.querySelectorAll('#columns .column');
[].forEach.call(cols, function(col) {
    var dragObj = new DragObj(col);
});


