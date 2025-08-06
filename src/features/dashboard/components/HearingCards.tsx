import React, { useCallback, memo } from 'react';
import Button from '@/shared/components/button';

interface Card {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  footerText: string;
  isHearing?: string;
  isHearingManage?: string;
}

interface CardSectionProps {
  cardData: Card[];
  handleRedirect: (isHearing?: string, isHearingManage?: string) => void;
}

const HearingCards = memo(({ cardData, handleRedirect }: CardSectionProps) => {
  const handleButtonClick = useCallback(
    (isHearing?: string, isHearingManage?: string) => {
      return () => handleRedirect(isHearing, isHearingManage);
    },
    [handleRedirect]
  );

  return (
    <section className="flex flex-wrap">
      {cardData.map((card) => (
        <CardItem 
          key={card.id} 
          card={card} 
          onButtonClick={handleButtonClick} 
        />
      ))}
    </section>
  );
});

const CardItem = memo(({ 
  card, 
  onButtonClick 
}: { 
  card: Card; 
  onButtonClick: (isHearing?: string, isHearingManage?: string) => () => void;
}) => {
  return (
    <div className='md:w-1/2 md:p-2 w-full p-1'>
    <div className="overflow-hidden h-[276px] p-4xl bg-light-alpha-white rounded-md flex flex-col items-center justify-between relative shadow-md">
      <div className="absolute top-[28px] left-[16px] bg-primary-50 p-3 rounded-md">
        {card.icon}
      </div>

      <div className="text-start mt-8 flex justify-start items-center h-full">
        <div className="flex flex-col space-y-[14px]">
          <h3 className="text-lg bold">{card.title}</h3>
          <p className="!text-md regular text-gray-800 flex">
            {card.description}
          </p>
        </div>
      </div>

      <div className="w-full flex justify-end items-center pb-2">
        <Button
          value="primary"
          onClick={onButtonClick(card?.isHearing, card?.isHearingManage)}
        >
          {card.footerText}
        </Button>
      </div>
    </div>
    </div>
  );
});

export default HearingCards;