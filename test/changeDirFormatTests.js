var expect = require('chai').expect;

changeDirFormat = require("./changeDirFormat");

describe('expand simple directory', function() {

    it('should expand simple directory', function() {
        var changed = changeDirFormat({
            a: {}
        });
        expect(changed).to.deep.equal({
            '-path': '/a',
            '-type': 'd'
        });
    });

    it('should expand nested directories', function() {
        var changed = changeDirFormat({
            a: {
                b: {
                    c: {}
                }
            }
        });
        expect(changed).to.deep.equal({
            '-path': '/a',
            '-type': 'd',
            "b": {
                "-path": "/a/b",
                "-type": "d",
                "c": {
                    "-path": "/a/b/c",
                    "-type": "d"
              }
            }
        });
    });

    it('should expand folders and files', function() {
        var changed = changeDirFormat({
            a: {
                b: {
                    c: {
                        q: '133',
                        w: '987',
                        e: '987',
                        r: '999'
                    }
                }
            }
        });
        expect(changed).to.deep.equal({
            '-path': '/a',
            '-type': 'd',
            "b": {
                "-path": "/a/b",
                "-type": "d",
                "c": {
                    "-path": "/a/b/c",
                    "-type": "d",
                    "e": {
                        "-content": "987",
                        "-path": "/a/b/c/e",
                        "-type": "-"
                    },
                    "q": {
                        "-content": "133",
                        "-path": "/a/b/c/q",
                        "-type": "-"
                    },
                    "r": {
                        "-content": "999",
                        "-path": "/a/b/c/r",
                        "-type": "-"
                    },
                    "w": {
                        "-content": "987",
                        "-path": "/a/b/c/w",
                        "-type": "-"
                    }
              }
            }
        });
    });

});
