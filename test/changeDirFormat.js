var reduce = require('ramda').reduce;

module.exports = function(directories) {
    changed = changeDirFormatDir(directories, '');
    return changed[Object.keys(directories)[0]];
};

function changeDirFormat(children,path) {
    switch(typeof(children)) {
	    case 'string': return changeDirFormatString(children, path);
	    default: return changeDirFormatDir(children, path);
    }
}

function changeDirFormatString(str, path) {
    return {
	    '-content': str,
	    '-path': path,
	    '-type': '-'
    };
}

function changeDirFormatDir(children, path) {
    var dir = {
        '-path': path,
        '-type': 'd'
    };

    return reduce(function(acc, child) {
	    acc[child] = changeDirFormat(
            children[child],
            path+'/'+child
        );
	    return acc;
    }, dir, Object.keys(children));
}
