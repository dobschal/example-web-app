let listeners = [];

function on( name, fn )
{
    console.log(`[event.js] New listener for event '${name}'`);
    listeners.push( { name, fn });
}

function broadcast( name, data )
{    
    let amountOfListeners = 0;
    listeners.forEach( listener => {        
        if( listener.name === name ) 
        {
            listener.fn( data ); 
            amountOfListeners++;
        }
    });
    console.log(`[event.js] Broadcasted event '${name}' to ${amountOfListeners} listeners.`);
}

function off( name )
{
    for(let i = listeners.length - 1; i >= 0; i--)
    {
        if(listeners[i].name === name)
        {
            listeners.splice(i, 1);
        }
    }
}

module.exports = { broadcast, on, off };