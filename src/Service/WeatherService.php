<?php

namespace App\Service;
use \Datetime;
use Symfony\Component\HttpClient\HttpClient;
use \Exception;

class WeatherService
{
    private $client;
    private $apiKey;

    public function __construct($apiKey)
    {
        $this->client = HttpClient::create();
        $this->apiKey = $apiKey;
    }

    /**
     * @return array
     */
    public function getWeather($id)
    {
        //$response = $this->client->request('GET', 'https://api.openweathermap.org/data/2.5/weather?lon=1.44&lat=43.6&appid=' . $this->apiKey);

        try{

            $response = $this->client->request('GET', 'https://api.openweathermap.org/data/2.5/weather?id='.$id.'&appid=' . $this->apiKey);
            $content = json_decode($response->getContent());

            return [
                'temperature' => $content->main->temp - 273,15, // en °C
                'temp_min' => $content->main->temp_min - 273.15,
                'temp_max' => $content->main->temp_max - 273.15,
                'precipitations' => $content->clouds->all,
                'humidite' => $content->main->humidity,
                'vent' => $content->wind->speed * pow(10, -3) * 3600, // en km/H
                'pression' => $content->main->pressure,
                'name' => $content->name,
                'country' => $content->sys->country,
                'icon'=>$content->weather[0]->icon,
                'timezone' => $content->timezone,
            ];
            //return null;
        }catch(Exception $e){
            return $e;
        }
    }


    /**
     * @return array
     */
    public function getWeatherByCoordinates($lat, $lon)
    {
        //$response = $this->client->request('GET', 'https://api.openweathermap.org/data/2.5/weather?lon=1.44&lat=43.6&appid=' . $this->apiKey);

        try{
            $response = $this->client->request('GET', 'https://api.openweathermap.org/data/2.5/weather?lat='.$lat.'&lon='.$lon.'&appid=' . $this->apiKey);

            $content = json_decode($response->getContent());

            return $content->id;

        }catch(Exception $e){
            return $e;
        }
    }
}
