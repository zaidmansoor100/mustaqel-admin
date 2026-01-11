import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
    standalone: true,
    selector: 'app-bars-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
        <div class="grid grid-cols-10 gap-2 items-end">
            <div class="col-span-4 flex justify-center items-center text-xs font-semibold flex-col gap-1 text-white">
                <div class="title text-lg w-full font-bold mb-2 h-12 bg-[#d9d9d9] text-black  flex justify-center items-center">Investor</div>
                <div class="bg-[#82163a] p-2 flex min-h-12  w-full leading-4  text-white flex-col justify-center items-center ">
                    <div>204</div>
                    <div>Candidates</div>
                </div>
                <div class="bg-[#c52158] p-2 flex min-h-12 w-[90%] leading-4 text-white flex-col justify-center items-center ">
                    <div>111</div>
                    <div>They were hosted</div>
                </div>
                <div class="bg-[#202e5d] p-2 flex min-h-12  w-[80%] leading-4 text-white flex-col justify-center items-center ">
                    <div>30</div>
                    <div>Request received </div>
                </div>
                <div class="bg-[#202e5d] p-2 flex min-h-12  w-[80%] leading-4 text-white flex-col justify-center items-center ">
                    <div>25</div>
                    <div>Parameter matching </div>
                </div>
                <div class="bg-[#f5ebde] p-2 flex min-h-12 w-[80%] leading-4 text-black flex-col justify-center items-center ">
                    <div>25</div>
                    <div>Request accepted </div>
                </div>
                <div class="bg-[#d9f5eb] p-2 flex min-h-12 w-[50%] leading-4 text-black flex-col justify-center items-center ">
                    <div>17</div>
                    <div>Received request</div>
                </div>
                <div class="bg-[#a6d1bf] p-2 flex min-h-12 w-[34%] leading-4 text-black flex-col justify-center items-center ">
                    <div>204</div>
                    <div>Residence</div>
                </div>
            </div> 
            <div class="col-span-4 flex justify-center items-center text-xs font-semibold flex-col gap-1 text-white">
                <div class="title text-lg w-full font-bold mb-2 h-12 bg-[#d9d9d9] text-black  flex justify-center items-center">Entrepreneurs</div>
                <div class="bg-[#82163a] p-2 flex min-h-12  w-full leading-4  text-white flex-col justify-center items-center ">
                    <div>204</div>
                    <div>Candidates</div>
                </div>
                <div class="bg-[#c52158] p-2 flex min-h-12 w-[90%] leading-4 text-white flex-col justify-center items-center ">
                    <div>111</div>
                    <div>They were hosted</div>
                </div>
                <div class="bg-[#202e5d] p-2 flex min-h-12  w-[80%] leading-4 text-white flex-col justify-center items-center ">
                    <div>30</div>
                    <div>Request received \</div>
                </div>
                <div class="bg-[#202e5d] p-2 flex min-h-12  w-[80%] leading-4 text-white flex-col justify-center items-center ">
                    <div>25</div>
                    <div>Parameter matching </div>
                </div>
                <div class="bg-[#f5ebde] p-2 flex min-h-12 w-[80%] leading-4 text-black flex-col justify-center items-center ">
                    <div>25</div>
                    <div>Request accepted </div>
                </div>
                <div class="bg-[#d9f5eb] p-2 flex min-h-12 w-[50%] leading-4 text-black flex-col justify-center items-center ">
                    <div>17</div>
                    <div>Received request</div>
                </div>
                <div class="bg-[#a6d1bf] p-2 flex min-h-12 w-[34%] leading-4 text-black flex-col justify-center items-center ">
                    <div>204</div>
                    <div>Residence</div>
                </div>
            </div>  
            <div class="col-span-2 flex justify-center items-center flex-col gap-1 text-white text-xs font-semibold">
                <!-- <div class="title text-xl w-full font-bold h-12 bg-gray-300 text-black  flex justify-center items-center">Investor</div> -->
                <div class="bg-[#82163a] p-2 flex min-h-12  w-full  leading-4 text-white flex-col justify-center items-center ">
                     <div>Candidates</div>
                </div>
                <div class="bg-[#c52158] p-2 flex min-h-12 w-full leading-4 text-white flex-col justify-center items-center ">
                     <div>Hosting</div>
                </div>
                <div class="bg-[#202e5d] p-2 flex min-h-12  w-full leading-4 text-white flex-col justify-center items-center ">
                    <div>Jusour</div>
                    <div class="whitespace-nowrap">Receiving requests</div>
                </div>
                <div class="bg-[#202e5d] p-2 flex min-h-12  w-full leading-4 text-white flex-col justify-center items-center ">
                    <div>Jusour</div>
                    <div class="whitespace-nowrap">Parameter matching</div>
                </div>
                <div class="bg-[#f5ebde] p-2 flex min-h-12 w-full leading-4 text-black flex-col justify-center items-center ">
                    <!-- <div>204</div> -->
                    <div class="whitespace-nowrap">MOL</div>
                </div>
                <div class="bg-[#d9f5eb] p-2 flex min-h-12 w-full leading-4 text-black flex-col justify-center items-center ">
                    <!-- <div>204</div> -->
                    <div>Hayya / MOI</div>
                </div>
                <div class="bg-[#a6d1bf] p-2 flex min-h-12 w-full leading-4 text-black flex-col justify-center items-center ">
                    <!-- <div>204</div> -->
                    <div>Residencies</div>
                </div>
            </div>
        </div>
    `
})
export class BarsWidget {
    menu = null;

    items = [
        { label: 'AddNew ', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];
}
