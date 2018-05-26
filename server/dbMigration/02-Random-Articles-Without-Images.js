const Article = require("../models/Article");

const randomTextSource = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";

exports.id = 'RandomArticlesWithoutImages2';

exports.up = done =>
{
    console.log("[02-Random-Articles-Without-Images.js] Started DBMigration script.");

    Article.remove({}, error => {

        if( error ) throw new Error( error );

        console.log("[02-Random-Articles-Without-Images.js] Removed all entries...");

        for( let i = 0; i < 50; i++ )
        {
            let title = randomText( 5 );
            let content = randomText( 20 );
            let modifiedAt = randomDate("05/09/2017", "08/20/2020");
            let images = [];
            
            let article = new Article({ title, content, modifiedAt, images });

            article.save( err => { 
                if (err) throw new Error("[01-Random-Artiles.js] Unable to save article in database!\n   " + err.message);
                console.log( "[01-Random-Artiles.js] Added random article with title '" + title + "'" );
            });

        }

        done();
    });
};

function randomText( amountOfWords )
{
    let text = "";
    let randomTextAsArray = randomTextSource.split(" ");    
    let randomWordIndex = Math.floor( Math.random() * randomTextAsArray.length );
    for (let i = randomWordIndex; i < randomTextAsArray.length && i < randomWordIndex + amountOfWords; i++)
    {
        const word = randomTextAsArray[i];
        text += word + " ";
    }
    return text;
}

function randomDate(date1, date2){
    let getRandomArbitrary = (min, max) =>
    {
      return Math.random() * (max - min) + min;
    };
    var date1 = date1 || '01-01-1970';
    var date2 = date2 || new Date().toLocaleDateString();
    date1 = new Date(date1).getTime();
    date2 = new Date(date2).getTime();
    if( date1>date2){
        return new Date(getRandomArbitrary(date2,date1));
    } else{
        return new Date(getRandomArbitrary(date1, date2));
    }
}