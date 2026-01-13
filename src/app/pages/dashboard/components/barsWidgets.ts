import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RequestService } from '@/services/request.service';

@Component({
    standalone: true,
    selector: 'app-bars-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
        <div class="grid grid-cols-12 gap-2 items-end">
            
            <div class="grid grid-cols-7 gap-2 col-span-4 items-start"> 
                <div class="col-span-5 flex justify-center items-center text-xs font-semibold flex-col gap-1 text-white">
                    <div class="title text-lg w-full font-bold mb-2 h-12 bg-[#d9d9d9] text-black  flex justify-center items-center">Investors</div>
                    <div class="bg-[#82163a] p-2 flex min-h-12  w-full leading-4  text-white flex-col justify-center items-center ">
                        <div>{{stats?.submitted?.Investor}}</div>
                        <div>Application submitted</div>
                    </div>
                    <div class="bg-[#c52158] p-2 flex min-h-12 w-[90%] leading-4 text-white flex-col justify-center items-center ">
                        <div>{{stats?.qcCompleted?.Investor}}</div>
                        <div>QC completed</div>
                    </div>
                    <div class="bg-[#202e5d] p-2 flex min-h-12  w-[80%] leading-4 text-white flex-col justify-center items-center ">
                        <div>{{stats?.endorsed?.Investor}}</div>
                        <div>Endorsed</div>
                    </div>
                    <div class="bg-[#f5ebde] p-2 flex min-h-12 w-[80%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.molApproved?.Investor}}</div>
                        <div>MOL approved</div>
                    </div>
                    <div class="bg-[#d9f5eb] p-2 flex min-h-12 w-[50%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.hayyaApproved?.Investor}}</div>
                        <div>Hayya Approved</div>
                    </div>
                    <div class="bg-[#a6d1bf] p-2 text-center flex min-h-12 w-[34%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.visaQidIssue?.Investor}}</div>
                        <div>Visa/QID issued</div>
                    </div>
                </div> 
                <div class="col-span-2 flex justify-center items-center flex-col gap-1 text-white text-xs font-semibold">
                    <div class="title text-lg w-full font-bold mb-2 h-12  flex justify-center items-center"></div>

                    <div class="bg-[#aa304e] p-2 flex min-h-12  w-full  leading-4 text-white flex-col justify-center items-center ">
                        <!-- <div>204</div> -->
                        <div>QC rejected</div>
                    </div>
                    <div class="bg-[#202e5dc7] p-2 flex min-h-12 w-full leading-4 text-center text-white flex-col justify-center items-center ">
                        <div>Endorser rejected</div>
                    </div>
                    <div class="bg-[#eae3da] text-center text-black p-2 flex min-h-12  w-full leading-4 flex-col justify-center items-center ">
                        <div>MOL rejected
</div>
                    </div>
                    <div class="bg-[#d9e3dffa] p-2 flex min-h-12 w-full leading-4 text-black flex-col justify-center items-center ">
                        <div>Hayya rejected</div>
                    </div> 
                </div>
                <div class="col-span-7">
                    <div class="border-dashed border-gray-400 border-t-2 my-4"></div>
            <!-- <div class="title text-lg w-full font-bold mb-2 h-12 bg-[#d9d9d9] text-black  flex justify-center items-center">Totals</div> -->
                    <div class="grid grid-cols-7 gap-2 items-start">
                        <div class="bg-[#82163a] p-2 flex min-h-12 col-span-5  w-full leading-4  text-white flex-col justify-center items-center ">
                            <div><strong>Total Process</strong></div>
                            <div>{{getTotalApplications('Investor') }}</div>
                        </div>
                        <div class="bg-[#82163a] p-2 flex min-h-12 col-span-2  w-full leading-4  text-white flex-col justify-center items-center ">
                            <div><strong>Total Rejected</strong></div>
                            <div>0</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-7 gap-2 col-span-4 items-start"> 
                <div class="col-span-5 flex justify-center items-center text-xs font-semibold flex-col gap-1 text-white">
                    <div class="title text-lg w-full font-bold mb-2 h-12 bg-[#d9d9d9] text-black  flex justify-center items-center">Entrepreneurs</div>
                    <div class="bg-[#82163a] p-2 flex min-h-12  w-full leading-4  text-white flex-col justify-center items-center ">
                        <div>{{stats?.submitted?.Entrepreneur}}</div>
                        <div>Application submitted</div>
                    </div>
                    <div class="bg-[#c52158] p-2 flex min-h-12 w-[90%] leading-4 text-white flex-col justify-center items-center ">
                        <div>{{stats?.qcCompleted?.Entrepreneur}}</div>
                        <div>QC completed</div>
                    </div>
                    <div class="bg-[#202e5d] p-2 flex min-h-12  w-[80%] leading-4 text-white flex-col justify-center items-center ">
                        <div>{{stats?.endorsed?.Entrepreneur}}</div>
                        <div>Endorsed</div>
                    </div>
                    <div class="bg-[#f5ebde] p-2 flex min-h-12 w-[80%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.molApproved?.Entrepreneur}}</div>
                        <div>MOL approved</div>
                    </div>
                    <div class="bg-[#d9f5eb] p-2 flex min-h-12 w-[50%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.hayyaApproved?.Entrepreneur}}</div>
                        <div>Hayya Approved</div>
                    </div>
                    <div class="bg-[#a6d1bf] p-2 text-center flex min-h-12 w-[34%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.visaQidIssue?.Entrepreneur}}</div>
                        <div>Visa/QID issued</div>
                    </div>
                </div> 
                <div class="col-span-2 flex justify-center items-center flex-col gap-1 text-white text-xs font-semibold">
                    <div class="title text-lg w-full font-bold mb-2 h-12  flex justify-center items-center"></div>

                    <div class="bg-[#aa304e] p-2 flex min-h-12  w-full  leading-4 text-white flex-col justify-center items-center ">
                        <!-- <div>204</div> -->
                        <div>QC rejected</div>
                    </div>
                    <div class="bg-[#202e5dc7] p-2 flex min-h-12 w-full leading-4 text-center text-white flex-col justify-center items-center ">
                        <div>Endorser rejected</div>
                    </div>
                    <div class="bg-[#eae3da] text-center text-black p-2 flex min-h-12  w-full leading-4 flex-col justify-center items-center ">
                        <div>MOL rejected
</div>
                    </div>
                    <div class="bg-[#d9e3dffa] p-2 flex min-h-12 w-full leading-4 text-black flex-col justify-center items-center ">
                        <div>Hayya rejected</div>
                    </div> 
                </div>
                <div class="col-span-7">
                    <div class="border-dashed border-gray-400 border-t-2 my-4"></div>
                    <!-- <div class="title text-lg w-full font-bold mb-2 h-12 bg-[#d9d9d9] text-black  flex justify-center items-center">Totals</div> -->
                    <div class="grid grid-cols-7 gap-2 items-start">
                        <div class="bg-[#82163a] p-2 flex min-h-12 col-span-5  w-full leading-4  text-white flex-col justify-center items-center ">
                            <div><strong>Total Process</strong></div>
                            <div>{{getTotalApplications('Entrepreneur') }}</div>
                        </div>
                        <div class="bg-[#82163a] p-2 flex min-h-12 col-span-2  w-full leading-4  text-white flex-col justify-center items-center ">
                            <div><strong>Total Rejected</strong></div>
                            <div>0</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-7 gap-2 col-span-4 items-start"> 
                <div class="col-span-5 flex justify-center items-center text-xs font-semibold flex-col gap-1 text-white">
                    <div class="title text-lg w-full font-bold mb-2 h-12 bg-[#d9d9d9] text-black  flex justify-center items-center">Talents</div>
                    <div class="bg-[#82163a] p-2 flex min-h-12  w-full leading-4  text-white flex-col justify-center items-center ">
                        <div>{{stats?.submitted?.Talent}}</div>
                        <div>Application submitted</div>
                    </div>
                    <div class="bg-[#c52158] p-2 flex min-h-12 w-[90%] leading-4 text-white flex-col justify-center items-center ">
                        <div>{{stats?.qcCompleted?.Talent}}</div>
                        <div>QC completed</div>
                    </div>
                    <div class="bg-[#202e5d] p-2 flex min-h-12  w-[80%] leading-4 text-white flex-col justify-center items-center ">
                        <div>{{stats?.endorsed?.Talent}}</div>
                        <div>Endorsed</div>
                    </div>
                    <div class="bg-[#f5ebde] p-2 flex min-h-12 w-[80%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.molApproved?.Talent}}</div>
                        <div>MOL approved</div>
                    </div>
                    <div class="bg-[#d9f5eb] p-2 flex min-h-12 w-[50%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.hayyaApproved?.Talent}}</div>
                        <div>Hayya Approved</div>
                    </div>
                    <div class="bg-[#a6d1bf] p-2 text-center flex min-h-12 w-[34%] leading-4 text-black flex-col justify-center items-center ">
                        <div>{{stats?.visaQidIssue?.Talent}}</div>
                        <div>Visa/QID issued</div>
                    </div>
                </div> 
                <div class="col-span-2 flex justify-center items-center flex-col gap-1 text-white text-xs font-semibold">
                        <div class="title text-lg w-full font-bold mb-2 h-12  flex justify-center items-center"></div>

                        <div class="bg-[#aa304e] p-2 flex min-h-12  w-full  leading-4 text-white flex-col justify-center items-center ">
                            <!-- <div>204</div> -->
                            <div>QC rejected</div>
                        </div>
                        <div class="bg-[#202e5dc7] p-2 text-center flex min-h-12 w-full leading-4 text-white flex-col justify-center items-center ">
                            <div>Endorser rejected</div>
                        </div>
                        <div class="bg-[#eae3da] text-center text-black p-2 flex min-h-12  w-full leading-4 flex-col justify-center items-center ">
                            <div>MOL rejected
                        </div>
                        </div>
                        <div class="bg-[#d9e3dffa] p-2 flex min-h-12 w-full leading-4 text-black flex-col justify-center items-center ">
                            <div>Hayya rejected</div>
                        </div> 
                </div>
                
                <div class="col-span-7">
                    <div class="border-dashed border-gray-400 border-t-2 my-4 mt-6"></div>
                    <!-- <div class="title text-lg w-full font-bold mb-2 h-12 bg-[#d9d9d9] text-black  flex justify-center items-center">Totals</div> -->
                    <div class="grid grid-cols-7 gap-2 items-start">
                        <div class="bg-[#82163a] p-2 flex min-h-12 col-span-5  w-full leading-4  text-white flex-col justify-center items-center ">
                            <div><strong>Total Process</strong></div>
                            <div>{{getTotalApplications('Talent') }}</div>
                        </div>
                        <div class="bg-[#82163a] p-2 flex min-h-12 col-span-2  w-full leading-4  text-white flex-col justify-center items-center ">
                            <div><strong>Total Rejected</strong></div>
                            <div>0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class BarsWidget implements OnInit {
    constructor(private requestService: RequestService) {

    }
    stats: any;
    menu = null;
    stageSequence: any;
    items = [
        { label: 'AddNew ', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];
    ngOnInit() {
        this.getStats()
    }

    getTotalApplications(type: 'Talent' | 'Investor' | 'Entrepreneur' | 'Executive'): number {
        if (!this.stats) return 0;

        const stages = [
            'submitted',
            'qcCompleted',
            'endorsed',
            'molApproved',
            'hayyaApproved',
            'visaQidIssue'
         ];

        return stages.reduce((total, stage) => {
            return total + (this.stats?.[stage]?.[type] ?? 0);
        }, 0);
    }

    getStats() {
        this.requestService.getStats().subscribe({
            next: (res: any) => {
                // console.log(res)
                this.stats = res.data
            },
            error: (err: any) => {
                console.log(err)
            }
        })
    }
}
