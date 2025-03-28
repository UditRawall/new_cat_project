import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


export interface CatImage {
    id: string;
    url: string;
    width: number;
    height: number;
    breeds?: Breed[];
  }
  
  export interface Breed {
    id: string;
    name: string;
    description?: string;
    temperament?: string;
    origin?: string;
  }
  
  export interface CatGalleryProps {
    apiKey?: string;
  }

  const CatGallery: React.FC<CatGalleryProps> = ({ 
    apiKey = 'live_9xts7O7OsIsa1DzDtTsbhAtYOqN0R6AHA9y5VEO68hKROT2IFAJtsm8Os0yJuL1D' 
  }) => {
    const [cats, setCats] = useState<CatImage[]>([]);
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
  
    const LIMIT = 10;
  
    const fetchCatImages = async (breedId: string | null = null): Promise<void> => {
      setIsLoading(true);
      try {
        const url = new URL('https://api.thecatapi.com/v1/images/search');
        url.searchParams.append('limit', LIMIT.toString());
        url.searchParams.append('page', page.toString());
        
        if (breedId && breedId !== 'all') {
          url.searchParams.append('breed_ids', breedId);
        }
  
        const response = await fetch(url, {
          headers: {
            'x-api-key': apiKey
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data: CatImage[] = await response.json();
        
        console.log('Fetched Cat Images:', data);
  
        const validImages = data.filter(cat => cat.url);
        
        setCats(prevCats => 
          page === 1 ? validImages : [...prevCats, ...validImages]
        );
        
        setPage(prevPage => prevPage + 1);
      } catch (error) {
        console.error('Error fetching cat images:', error);
        alert(`Failed to fetch cat images: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
  
    const fetchBreeds = async (): Promise<void> => {
      try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds', {
          headers: {
            'x-api-key': apiKey
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data: Breed[] = await response.json();
        setBreeds(data);
      } catch (error) {
        console.error('Error fetching cat breeds:', error);
        alert(`Failed to fetch cat breeds: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
  
    useEffect(() => {
      fetchCatImages();
      fetchBreeds();
    }, []);
  
    const handleBreedChange = (breedId: string) => {

      console.log('Selected Breed:', breedId);
      setSelectedBreed(breedId);
      setPage(1);
      fetchCatImages(breedId);
    };
  
    const handleLoadMore = () => {
      fetchCatImages(selectedBreed);
    };
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Cat Images Gallery</h1>
        
        <div className="mb-4 flex justify-center">
          <Select 
            onValueChange={handleBreedChange} 
            value={selectedBreed || 'all'}
            
          >
            <SelectTrigger className="w-[280px] text-black p-5" style={{ backgroundColor: '#aba8a8' }}>
              <SelectValue placeholder="Select a Cat Breed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Breeds</SelectItem>
              {breeds.map((breed) => (
                <SelectItem key={breed.id} value={breed.id}>
                  {breed.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
  
        {cats.length === 0 ? (
          <div className="text-center text-gray-500">No images found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cats.map((cat, index) => (
              <Card key={cat.id || `cat-${index}`} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-2">
                  <img 
                    src={cat.url} 
                    alt={`Cat ${index + 1}`} 
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      console.error('Image load error', e);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
  
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleLoadMore} 
            disabled={isLoading}
            className="w-48"
          >
            {isLoading ? 'Loading...' : 'Load More Cats'}
          </Button>
        </div>
      </div>
    );
  };
  
  export default CatGallery;